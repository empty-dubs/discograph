import * as discogs from '$lib/discogs/client';

import {
	buildFromArtist,
	buildFromArtistReleases,
	buildFromLabel,
	buildFromLabelReleases,
	buildFromMaster,
	buildFromMasterVersions,
	buildFromRelease,
	buildFromSearchResult
} from './builder';

import { ALL_NODE_TYPES } from './constants';

import type { RateLimitInfo, SearchResult, SearchType } from '$lib/discogs/types';

import type { GraphLink, GraphNode, GraphPatch, NodeType } from './types';

class GraphStore {
	nodes = $state<Map<string, GraphNode>>(new Map());
	links = $state<Map<string, GraphLink>>(new Map());
	expanded = $state<Set<string>>(new Set());
	loading = $state<Set<string>>(new Set());
	seedId = $state<string | null>(null);
	selectedId = $state<string | null>(null);
	rateLimit = $state<RateLimitInfo>({ limit: null, used: null, remaining: null });
	error = $state<string | null>(null);
	searchResults = $state<SearchResult[]>([]);
	releasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	visibleTypes = $state<Set<NodeType>>(new Set(ALL_NODE_TYPES));
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	viewResetToken = $state(0);

	get nodeList(): GraphNode[] {
		return Array.from(this.nodes.values());
	}

	get linkList(): GraphLink[] {
		return Array.from(this.links.values());
	}

	get pinnedIds(): Set<string> {
		const pinned = new Set<string>();

		if (this.seedId) pinned.add(this.seedId);
		if (this.selectedId) pinned.add(this.selectedId);

		return pinned;
	}

	get visibleNodeList(): GraphNode[] {
		return this.filterVisibleNodes(this.nodeList, this.visibleTypes, this.pinnedIds);
	}

	get visibleLinkList(): GraphLink[] {
		const visibleNodeIds = new Set(this.visibleNodeList.map((n) => n.id));

		return this.filterVisibleLinks(this.linkList, visibleNodeIds);
	}

	get typeCounts(): Record<NodeType, number> {
		const counts = Object.fromEntries(ALL_NODE_TYPES.map((t) => [t, 0])) as Record<NodeType, number>;

		for (const node of this.nodeList) {
			counts[node.type]++;
		}

		return counts;
	}

	get selectedNode(): GraphNode | null {
		return this.selectedId ? (this.nodes.get(this.selectedId) ?? null) : null;
	}

	get isRateLimited(): boolean {
		return this.rateLimit.remaining !== null && this.rateLimit.remaining <= 0;
	}

	private updateRateLimit() {
		this.rateLimit = discogs.getLastRateLimit();
	}

	private parseNodeId(id: string): { type: NodeType; discogsId: number | null } {
		const [type, rawId] = id.split(':');

		if (!type || !rawId) return { type: 'artist', discogsId: null };
		if (type === 'track') return { type: 'track', discogsId: null };

		const discogsId = Number(rawId);

		return {
			type: type as NodeType,
			discogsId: Number.isNaN(discogsId) ? null : discogsId
		};
	}

	private filterVisibleNodes(
		nodes: GraphNode[],
		visibleTypes: Set<NodeType>,
		pinnedIds: Set<string>
	): GraphNode[] {
		return nodes.filter((n) => visibleTypes.has(n.type) || pinnedIds.has(n.id));
	}

	private filterVisibleLinks(links: GraphLink[], visibleNodeIds: Set<string>): GraphLink[] {
		return links.filter((l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target));
	}

	private mergePatch(
		nodes: Map<string, GraphNode>,
		links: Map<string, GraphLink>,
		patch: GraphPatch
	): void {
		for (const node of patch.nodes) {
			const existing = nodes.get(node.id);

			if (!existing) {
				nodes.set(node.id, node);
			} else {
				nodes.set(node.id, { ...existing, ...node, meta: { ...existing.meta, ...node.meta } });
			}
		}

		for (const link of patch.links) {
			links.set(link.id, link);
		}
	}

	private applyPatch(patch: GraphPatch) {
		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		this.mergePatch(nextNodes, nextLinks, patch);

		this.nodes = nextNodes;
		this.links = nextLinks;
	}

	private applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		const currentNodeIds = new Set(this.nodes.keys());

		this.applyPatch(patch);

		const newNodeIds = [...this.nodes.keys()].filter((id) => id !== parentNodeId && !currentNodeIds.has(id));

		if (newNodeIds.length === 0) return;

		const parentChildMap = new Map(this.expansionChildren);

		const childNodeIds = new Set(parentChildMap.get(parentNodeId) ?? []);

		for (const id of newNodeIds) {
			childNodeIds.add(id);
		}

		parentChildMap.set(parentNodeId, childNodeIds);

		this.expansionChildren = parentChildMap;
	}

	private collectDescendants(rootId: string): Set<string> {
		const descendants = new Set<string>();

		const visit = (id: string) => {
			const children = this.expansionChildren.get(id);

			if (!children) return;

			for (const childId of children) {
				if (descendants.has(childId)) continue;

				descendants.add(childId);

				visit(childId);
			}
		};

		visit(rootId);

		return descendants;
	}

	private setLoading(id: string, isLoading: boolean) {
		const next = new Set(this.loading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.loading = next;
	}

	clearGraph() {
		this.nodes = new Map();
		this.links = new Map();
		this.expanded = new Set();
		this.loading = new Set();
		this.seedId = null;
		this.selectedId = null;
		this.error = null;
		this.clearSearchResults();
		this.releasePages = new Map();
		this.expansionChildren = new Map();
		this.visibleTypes = new Set(ALL_NODE_TYPES);
		this.viewResetToken++;
	}

	clearSearchResults() {
		this.searchResults = [];
	}

	isTypeVisible(type: NodeType): boolean {
		return this.visibleTypes.has(type);
	}

	toggleType(type: NodeType) {
		const visibleTypes = new Set(this.visibleTypes);

		if (visibleTypes.has(type)) {
			if (visibleTypes.size <= 1) return;
			visibleTypes.delete(type);
		} else {
			visibleTypes.add(type);
		}

		this.visibleTypes = visibleTypes;
	}

	selectNode(id: string | null) {
		this.selectedId = id;
	}

	async search(query: string, type?: SearchType) {
		this.error = null;

		try {
			const response = await discogs.search(query, type);

			this.updateRateLimit();
			this.searchResults = response.results;

			return response.results;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Search failed';
			this.searchResults = [];
			return [];
		}
	}

	async seedFromResult(result: SearchResult) {
		this.clearGraph();
		this.error = null;

		const patch = buildFromSearchResult(result);

		this.applyPatch(patch);

		const seedNodeId = patch.nodes[0]?.id;

		if (!seedNodeId) return;

		this.seedId = seedNodeId;
		this.selectedId = seedNodeId;
		this.clearSearchResults();
	}

	async seedFromNode(node: GraphNode) {
		if (node.discogsId === null || node.type === 'track') return;

		await this.seedFromResult({
			id: node.discogsId,
			type: node.type,
			name: node.type === 'artist' || node.type === 'label' ? node.displayName : undefined,
			title: node.type === 'release' || node.type === 'master' ? node.displayName : undefined,
			uri: node.discogsUrl
		});
	}

	collapseNode(nodeId: string) {
		if (!this.expansionChildren.has(nodeId)) return;

		const descendants = this.collectDescendants(nodeId);
		const toRemove = new Set<string>();

		for (const id of descendants) {
			const hasExternalLink = this.linkList.some((link) => {
				const isEndpoint = link.source === id || link.target === id;
				if (!isEndpoint) return false;
				const other = link.source === id ? link.target : link.source;
				return other !== nodeId && !descendants.has(other);
			});

			if (!hasExternalLink) {
				toRemove.add(id);
			}
		}

		if (toRemove.size === 0) {
			const nextExpanded = new Set(this.expanded);
			nextExpanded.delete(nodeId);
			this.expanded = nextExpanded;
			return;
		}

		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		for (const id of toRemove) {
			nextNodes.delete(id);
		}

		for (const [linkId, link] of nextLinks) {
			if (toRemove.has(link.source) || toRemove.has(link.target)) {
				nextLinks.delete(linkId);
			}
		}

		this.nodes = nextNodes;
		this.links = nextLinks;

		const nextChildren = new Map(this.expansionChildren);
		for (const id of toRemove) {
			nextChildren.delete(id);
		}
		const parentChildren = new Set(nextChildren.get(nodeId) ?? []);
		for (const id of toRemove) {
			parentChildren.delete(id);
		}
		if (parentChildren.size === 0) {
			nextChildren.delete(nodeId);
		} else {
			nextChildren.set(nodeId, parentChildren);
		}
		this.expansionChildren = nextChildren;

		const nextExpanded = new Set(this.expanded);
		nextExpanded.delete(nodeId);
		for (const id of toRemove) {
			nextExpanded.delete(id);
		}
		this.expanded = nextExpanded;

		const nextReleasePages = new Map(this.releasePages);
		for (const id of toRemove) {
			nextReleasePages.delete(id);
		}
		this.releasePages = nextReleasePages;

		if (this.selectedId && toRemove.has(this.selectedId)) {
			this.selectedId = nodeId;
		}
		if (this.seedId && toRemove.has(this.seedId)) {
			this.seedId = nodeId;
		}
	}

	hasChildren(nodeId: string): boolean {
		const children = this.expansionChildren.get(nodeId);
		if (!children || children.size === 0) return false;
		return [...children].some((id) => this.nodes.has(id));
	}

	async expandNode(nodeId: string) {
		if (this.loading.has(nodeId)) return;

		const { type, discogsId } = this.parseNodeId(nodeId);

		if (type === 'track') return;

		if (this.expanded.has(nodeId)) return;

		if (discogsId === null) return;

		this.setLoading(nodeId, true);
		this.error = null;

		try {
			switch (type) {
				case 'artist': {
					const artist = await discogs.getArtist(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromArtist(artist));

					const releases = await discogs.getArtistReleases(discogsId);

					this.updateRateLimit();

					this.applyPatchFromExpansion(nodeId, buildFromArtistReleases(releases.releases, discogsId));

					this.releasePages = new Map(this.releasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});

					break;
				}
				case 'label': {
					const label = await discogs.getLabel(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromLabel(label));

					const releases = await discogs.getLabelReleases(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromLabelReleases(releases.releases, discogsId));

					this.releasePages = new Map(this.releasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});

					break;
				}
				case 'release': {
					const release = await discogs.getRelease(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromRelease(release));

					break;
				}
				case 'master': {
					const master = await discogs.getMaster(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromMaster(master));

					const versions = await discogs.getMasterVersions(discogsId);

					this.updateRateLimit();
					this.applyPatchFromExpansion(nodeId, buildFromMasterVersions(versions.versions, discogsId));

					this.releasePages = new Map(this.releasePages).set(nodeId, {
						page: versions.pagination.page,
						pages: versions.pagination.pages
					});

					break;
				}
			}

			this.expanded = new Set(this.expanded).add(nodeId);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to expand node';
		} finally {
			this.setLoading(nodeId, false);
		}
	}

	async loadMoreReleases(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		const paging = this.releasePages.get(nodeId);

		if (!paging || paging.page >= paging.pages) return;

		const nextPage = paging.page + 1;

		this.setLoading(nodeId, true);

		this.error = null;

		try {
			if (type === 'artist') {
				const releases = await discogs.getArtistReleases(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(nodeId, buildFromArtistReleases(releases.releases, discogsId));
				this.releasePages = new Map(this.releasePages).set(nodeId, {
					page: releases.pagination.page,
					pages: releases.pagination.pages
				});
			} else if (type === 'label') {
				const releases = await discogs.getLabelReleases(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(nodeId, buildFromLabelReleases(releases.releases, discogsId));
				this.releasePages = new Map(this.releasePages).set(nodeId, {
					page: releases.pagination.page,
					pages: releases.pagination.pages
				});
			} else if (type === 'master') {
				const versions = await discogs.getMasterVersions(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(nodeId, buildFromMasterVersions(versions.versions, discogsId));
				this.releasePages = new Map(this.releasePages).set(nodeId, {
					page: versions.pagination.page,
					pages: versions.pagination.pages
				});
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load more releases';
		} finally {
			this.setLoading(nodeId, false);
		}
	}

	hasMoreReleases(nodeId: string): boolean {
		const paging = this.releasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	isExpanded(nodeId: string): boolean {
		return this.expanded.has(nodeId);
	}

	isLoading(nodeId: string): boolean {
		return this.loading.has(nodeId);
	}
}

export const graphStore = new GraphStore();
