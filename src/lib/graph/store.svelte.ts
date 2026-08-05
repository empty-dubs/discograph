import * as discogs from '$lib/discogs/client';

import {
	buildFromArtist,
	buildFromArtistReleases,
	buildArtistsFromRelease,
	buildFromLabel,
	buildFromLabelReleases,
	buildFromMaster,
	buildFromMasterVersions,
	buildMainReleaseFromMaster,
	buildLabelsFromRelease,
	buildFromSearchResult
} from './builder';

import { ALL_NODE_TYPES } from './constants';

import type { Artist, Label, Master, RateLimitInfo, Release, ReleaseFormat, SearchResult, SearchType } from '$lib/discogs/types';

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
	searchQuery = $state('');
	searchType = $state<SearchType | ''>('');
	searching = $state(false);
	searchResults = $state<SearchResult[]>([]);
	releasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	masterReleasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	visibleTypes = $state<Set<NodeType>>(new Set(ALL_NODE_TYPES));
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	viewResetToken = $state(0);
	artistDetailsFetched = $state<Set<string>>(new Set());
	artistDetailsLoading = $state<Set<string>>(new Set());
	labelDetailsFetched = $state<Set<string>>(new Set());
	labelDetailsLoading = $state<Set<string>>(new Set());
	masterDetailsFetched = $state<Set<string>>(new Set());
	masterDetailsLoading = $state<Set<string>>(new Set());
	releaseDetailsFetched = $state<Set<string>>(new Set());
	releaseDetailsLoading = $state<Set<string>>(new Set());

	get nodeList(): GraphNode[] {
		return Array.from(this.nodes.values());
	}

	get linkList(): GraphLink[] {
		return Array.from(this.links.values());
	}

	get pinnedIds(): Set<string> {
		const pinned = new Set<string>();

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
		this.masterReleasePages = new Map();
		this.expansionChildren = new Map();
		this.visibleTypes = new Set(ALL_NODE_TYPES);
		this.artistDetailsFetched = new Set();
		this.artistDetailsLoading = new Set();
		this.labelDetailsFetched = new Set();
		this.labelDetailsLoading = new Set();
		this.masterDetailsFetched = new Set();
		this.masterDetailsLoading = new Set();
		this.releaseDetailsFetched = new Set();
		this.releaseDetailsLoading = new Set();
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

	private setArtistDetailsLoading(id: string, isLoading: boolean) {
		const next = new Set(this.artistDetailsLoading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.artistDetailsLoading = next;
	}

	private mergeArtistDetails(nodeId: string, artist: Artist) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const next = new Map(this.nodes);

		next.set(nodeId, {
			...existing,
			profile: artist.profile,
			realname: artist.realname ?? undefined,
			urls: artist.urls,
			namevariations: artist.namevariations,
			groups: artist.groups?.map(({ id, name }) => ({ id, name })),
			aliases: artist.aliases?.map(({ id, name }) => ({ id, name })),
			members: artist.members?.map(({ id, name, active }) => ({ id, name, active }))
		});

		this.nodes = next;
	}

	private markArtistDetailsFetched(nodeId: string) {
		this.artistDetailsFetched = new Set(this.artistDetailsFetched).add(nodeId);
	}

	async ensureArtistDetails(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (type !== 'artist' || discogsId === null) return;
		if (this.artistDetailsFetched.has(nodeId) || this.artistDetailsLoading.has(nodeId)) return;

		this.setArtistDetailsLoading(nodeId, true);
		this.error = null;

		try {
			const artist = await discogs.getArtist(discogsId);

			this.updateRateLimit();
			this.mergeArtistDetails(nodeId, artist);
			this.markArtistDetailsFetched(nodeId);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load artist details';
		} finally {
			this.setArtistDetailsLoading(nodeId, false);
		}
	}

	isArtistDetailsLoading(nodeId: string): boolean {
		return this.artistDetailsLoading.has(nodeId);
	}

	private setLabelDetailsLoading(id: string, isLoading: boolean) {
		const next = new Set(this.labelDetailsLoading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.labelDetailsLoading = next;
	}

	private mergeLabelDetails(nodeId: string, label: Label) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const next = new Map(this.nodes);

		next.set(nodeId, {
			...existing,
			profile: label.profile,
			urls: label.urls,
			parent_label: label.parent_label
				? { id: label.parent_label.id, name: label.parent_label.name }
				: undefined,
			sublabels: label.sublabels?.map(({ id, name }) => ({ id, name }))
		});

		this.nodes = next;
	}

	private markLabelDetailsFetched(nodeId: string) {
		this.labelDetailsFetched = new Set(this.labelDetailsFetched).add(nodeId);
	}

	async ensureLabelDetails(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (type !== 'label' || discogsId === null) return;
		if (this.labelDetailsFetched.has(nodeId) || this.labelDetailsLoading.has(nodeId)) return;

		this.setLabelDetailsLoading(nodeId, true);
		this.error = null;

		try {
			const label = await discogs.getLabel(discogsId);

			this.updateRateLimit();
			this.mergeLabelDetails(nodeId, label);
			this.markLabelDetailsFetched(nodeId);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load label details';
		} finally {
			this.setLabelDetailsLoading(nodeId, false);
		}
	}

	isLabelDetailsLoading(nodeId: string): boolean {
		return this.labelDetailsLoading.has(nodeId);
	}

	private setMasterDetailsLoading(id: string, isLoading: boolean) {
		const next = new Set(this.masterDetailsLoading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.masterDetailsLoading = next;
	}

	private async resolveMainReleaseTitle(id: number): Promise<string> {
		const releaseNodeId = `release:${id}`;
		const existing = this.nodes.get(releaseNodeId);

		if (existing) return existing.displayName;

		try {
			const release = await discogs.getRelease(id);
			this.updateRateLimit();
			return release.title;
		} catch {
			return `Release ${id}`;
		}
	}

	private async mergeMasterDetails(nodeId: string, master: Master) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const mainRelease = master.main_release
			? {
					id: master.main_release,
					title: await this.resolveMainReleaseTitle(master.main_release)
				}
			: undefined;

		const next = new Map(this.nodes);

		next.set(nodeId, {
			...existing,
			artists: master.artists?.map(({ id, name }) => ({ id, name })),
			tracklist: master.tracklist?.map(({ position, title, duration }) => ({
				position,
				title,
				duration
			})),
			main_release: mainRelease,
			meta: {
				...existing.meta,
				year: master.year ?? existing.meta?.year,
				genres: master.genres ?? existing.meta?.genres,
				styles: master.styles
			}
		});

		this.nodes = next;
	}

	private markMasterDetailsFetched(nodeId: string) {
		this.masterDetailsFetched = new Set(this.masterDetailsFetched).add(nodeId);
	}

	async ensureMasterDetails(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (type !== 'master' || discogsId === null) return;
		if (this.masterDetailsFetched.has(nodeId) || this.masterDetailsLoading.has(nodeId)) return;

		this.setMasterDetailsLoading(nodeId, true);
		this.error = null;

		try {
			const master = await discogs.getMaster(discogsId);

			this.updateRateLimit();
			await this.mergeMasterDetails(nodeId, master);
			this.markMasterDetailsFetched(nodeId);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load master details';
		} finally {
			this.setMasterDetailsLoading(nodeId, false);
		}
	}

	isMasterDetailsLoading(nodeId: string): boolean {
		return this.masterDetailsLoading.has(nodeId);
	}

	private setReleaseDetailsLoading(id: string, isLoading: boolean) {
		const next = new Set(this.releaseDetailsLoading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.releaseDetailsLoading = next;
	}

	private formatReleaseFormats(formats: ReleaseFormat[]): string {
		return formats
			.map((format) => [format.name, ...(format.descriptions ?? [])].filter(Boolean).join(', '))
			.join(' / ');
	}

	private async resolveMasterTitle(id: number): Promise<string> {
		const masterNodeId = `master:${id}`;
		const existing = this.nodes.get(masterNodeId);

		if (existing) return existing.displayName;

		try {
			const master = await discogs.getMaster(id);
			this.updateRateLimit();
			return master.title;
		} catch {
			return `Master ${id}`;
		}
	}

	private async mergeReleaseDetails(nodeId: string, release: Release) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const linkedMaster = release.master_id
			? {
					id: release.master_id,
					title: await this.resolveMasterTitle(release.master_id)
				}
			: undefined;

		const next = new Map(this.nodes);

		next.set(nodeId, {
			...existing,
			artists: (release.artists ?? [])
				.filter((artist): artist is typeof artist & { id: number } => artist.id !== undefined)
				.map(({ id, name }) => ({ id, name })),
			labels: release.labels?.map(({ id, name, catno }) => ({ id, name, catno })),
			credits: (release.extraartists ?? [])
				.filter((artist): artist is typeof artist & { id: number } => artist.id !== undefined)
				.map(({ id, name, role }) => ({ id, name, role })),
			companies: release.companies?.map(({ id, name, entity_type_name }) => ({
				id,
				name,
				entity_type_name
			})),
			tracklist: release.tracklist?.map(({ position, title, duration }) => ({
				position,
				title,
				duration
			})),
			notes: release.notes,
			linked_master: linkedMaster,
			meta: {
				...existing.meta,
				year: release.year ?? existing.meta?.year,
				genres: release.genres ?? existing.meta?.genres,
				styles: release.styles,
				released: release.released_formatted ?? release.released,
				country: release.country,
				format: release.formats?.length ? this.formatReleaseFormats(release.formats) : undefined
			}
		});

		this.nodes = next;
	}

	private markReleaseDetailsFetched(nodeId: string) {
		this.releaseDetailsFetched = new Set(this.releaseDetailsFetched).add(nodeId);
	}

	async ensureReleaseDetails(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (type !== 'release' || discogsId === null) return;
		if (this.releaseDetailsFetched.has(nodeId) || this.releaseDetailsLoading.has(nodeId)) return;

		this.setReleaseDetailsLoading(nodeId, true);
		this.error = null;

		try {
			const release = await discogs.getRelease(discogsId);

			this.updateRateLimit();
			await this.mergeReleaseDetails(nodeId, release);
			this.markReleaseDetailsFetched(nodeId);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load release details';
		} finally {
			this.setReleaseDetailsLoading(nodeId, false);
		}
	}

	isReleaseDetailsLoading(nodeId: string): boolean {
		return this.releaseDetailsLoading.has(nodeId);
	}

	async search(query: string, type?: SearchType) {
		const trimmed = query.trim();

		if (!trimmed || this.searching || this.isRateLimited) return [];

		this.searchQuery = trimmed;
		this.searchType = type ?? '';
		this.error = null;
		this.searching = true;

		try {
			const response = await discogs.search(trimmed, type);

			this.updateRateLimit();
			this.searchResults = response.results;

			return response.results;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Search failed';
			this.searchResults = [];
			return [];
		} finally {
			this.searching = false;
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
		if (node.discogsId === null) return;

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
		const nextMasterReleasePages = new Map(this.masterReleasePages);
		for (const id of toRemove) {
			nextReleasePages.delete(id);
			nextMasterReleasePages.delete(id);
		}
		this.releasePages = nextReleasePages;
		this.masterReleasePages = nextMasterReleasePages;

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

	private async runLoad(nodeId: string, fn: () => Promise<void>, errorMessage: string) {
		if (this.loading.has(nodeId)) return;

		const { discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		this.setLoading(nodeId, true);
		this.error = null;

		try {
			await fn();
		} catch (err) {
			this.error = err instanceof Error ? err.message : errorMessage;
		} finally {
			this.setLoading(nodeId, false);
		}
	}

	async loadRelatedArtists(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		await this.runLoad(
			nodeId,
			async () => {
				switch (type) {
					case 'artist': {
						const artist = await discogs.getArtist(discogsId);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildFromArtist(artist));
						this.markArtistDetailsFetched(nodeId);
						break;
					}
					case 'release': {
						const release = await discogs.getRelease(discogsId);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildArtistsFromRelease(release));
						break;
					}
					case 'master': {
						const master = await discogs.getMaster(discogsId);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildFromMaster(master));
						break;
					}
				}
			},
			'Failed to load related artists'
		);
	}

	async loadRelatedLabels(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		await this.runLoad(
			nodeId,
			async () => {
				switch (type) {
					case 'label': {
						const label = await discogs.getLabel(discogsId);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildFromLabel(label));
						this.markLabelDetailsFetched(nodeId);
						break;
					}
					case 'release': {
						const release = await discogs.getRelease(discogsId);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildLabelsFromRelease(release));
						break;
					}
				}
			},
			'Failed to load related labels'
		);
	}

	async loadReleases(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		await this.runLoad(
			nodeId,
			async () => {
				switch (type) {
					case 'artist': {
						const releases = await discogs.getArtistReleases(discogsId, 1);
						this.updateRateLimit();
						this.applyPatchFromExpansion(
							nodeId,
							buildFromArtistReleases(releases.releases, discogsId, 'release')
						);
						this.releasePages = new Map(this.releasePages).set(nodeId, {
							page: releases.pagination.page,
							pages: releases.pagination.pages
						});
						break;
					}
					case 'label': {
						const releases = await discogs.getLabelReleases(discogsId, 1);
						this.updateRateLimit();
						this.applyPatchFromExpansion(
							nodeId,
							buildFromLabelReleases(releases.releases, discogsId, 'release')
						);
						this.releasePages = new Map(this.releasePages).set(nodeId, {
							page: releases.pagination.page,
							pages: releases.pagination.pages
						});
						break;
					}
					case 'master': {
						const versions = await discogs.getMasterVersions(discogsId, 1);
						this.updateRateLimit();
						this.applyPatchFromExpansion(nodeId, buildFromMasterVersions(versions.versions, discogsId));
						this.releasePages = new Map(this.releasePages).set(nodeId, {
							page: versions.pagination.page,
							pages: versions.pagination.pages
						});
						break;
					}
				}
			},
			'Failed to load releases'
		);
	}

	async loadMasterReleases(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null) return;

		await this.runLoad(
			nodeId,
			async () => {
				switch (type) {
					case 'artist': {
						const releases = await discogs.getArtistReleases(discogsId, 1);
						this.updateRateLimit();
						this.applyPatchFromExpansion(
							nodeId,
							buildFromArtistReleases(releases.releases, discogsId, 'master')
						);
						this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, {
							page: releases.pagination.page,
							pages: releases.pagination.pages
						});
						break;
					}
					case 'label': {
						const releases = await discogs.getLabelReleases(discogsId, 1);
						this.updateRateLimit();
						this.applyPatchFromExpansion(
							nodeId,
							buildFromLabelReleases(releases.releases, discogsId, 'master')
						);
						this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, {
							page: releases.pagination.page,
							pages: releases.pagination.pages
						});
						break;
					}
				}
			},
			'Failed to load master releases'
		);
	}

	async loadMainRelease(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null || type !== 'master') return;

		await this.runLoad(
			nodeId,
			async () => {
				let mainReleaseId = this.nodes.get(nodeId)?.main_release?.id;

				if (!mainReleaseId) {
					const master = await discogs.getMaster(discogsId);
					this.updateRateLimit();
					await this.mergeMasterDetails(nodeId, master);
					this.markMasterDetailsFetched(nodeId);
					mainReleaseId = master.main_release;
				}

				if (!mainReleaseId) {
					this.error = 'This master has no main release';
					return;
				}

				const release = await discogs.getRelease(mainReleaseId);
				this.updateRateLimit();
				this.applyPatchFromExpansion(
					nodeId,
					buildMainReleaseFromMaster(release, discogsId)
				);
			},
			'Failed to load main release'
		);
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
				this.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'release')
				);
				this.releasePages = new Map(this.releasePages).set(nodeId, {
					page: releases.pagination.page,
					pages: releases.pagination.pages
				});
			} else if (type === 'label') {
				const releases = await discogs.getLabelReleases(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'release')
				);
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

	async loadMoreMasterReleases(nodeId: string) {
		const { type, discogsId } = this.parseNodeId(nodeId);

		if (discogsId === null || (type !== 'artist' && type !== 'label')) return;

		const paging = this.masterReleasePages.get(nodeId);

		if (!paging || paging.page >= paging.pages) return;

		const nextPage = paging.page + 1;

		this.setLoading(nodeId, true);

		this.error = null;

		try {
			if (type === 'artist') {
				const releases = await discogs.getArtistReleases(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'master')
				);
				this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, {
					page: releases.pagination.page,
					pages: releases.pagination.pages
				});
			} else {
				const releases = await discogs.getLabelReleases(discogsId, nextPage);
				this.updateRateLimit();
				this.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'master')
				);
				this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, {
					page: releases.pagination.page,
					pages: releases.pagination.pages
				});
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to load more master releases';
		} finally {
			this.setLoading(nodeId, false);
		}
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		const paging = this.masterReleasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	isLoading(nodeId: string): boolean {
		return this.loading.has(nodeId);
	}
}

export const graphStore = new GraphStore();
