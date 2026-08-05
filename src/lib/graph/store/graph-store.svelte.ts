import * as discogs from '$lib/discogs/client';

import { ALL_NODE_TYPES } from '../constants';

import { mergeArtistDetails } from './details/artist';
import { createDetailsTracker } from './details/create-details-tracker';
import { mergeLabelDetails } from './details/label';
import { mergeMasterDetails } from './details/master';
import { mergeReleaseDetails } from './details/release';
import { loadRelatedArtists, loadRelatedCreditedArtists } from './loaders/related-artists';
import { loadRelatedLabels, loadRelatedCompanies } from './loaders/related-labels';

import {
	collectDescendants,
	findRemovableDescendants,
	hasExpansionChildren
} from './expansion';

import {
	filterVisibleLinks,
	filterVisibleNodes,
	mergePatch,
	parseNodeId
} from './graph-core';


import {
	hasMoreMasterReleases,
	hasMoreReleases,
	loadMainRelease,
	loadMasterReleases,
	loadMoreMasterReleases,
	loadMoreReleases,
	loadReleases
} from './loaders/releases';

import { runLoad } from './run-load';
import { searchStore, seedFromNode, seedFromResult } from './search';

import type { RateLimitInfo, SearchResult, SearchType } from '$lib/discogs/types';
import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';
import type { DetailsTrackerContext, GraphStoreContext } from './types';

const artistDetailsTracker = createDetailsTracker({
	nodeType: 'artist',
	fetch: discogs.getArtist,
	merge: mergeArtistDetails,
	errorMessage: 'Failed to load artist details'
});

const labelDetailsTracker = createDetailsTracker({
	nodeType: 'label',
	fetch: discogs.getLabel,
	merge: mergeLabelDetails,
	errorMessage: 'Failed to load label details'
});

const masterDetailsTracker = createDetailsTracker({
	nodeType: 'master',
	fetch: discogs.getMaster,
	merge: mergeMasterDetails,
	errorMessage: 'Failed to load master details'
});

const releaseDetailsTracker = createDetailsTracker({
	nodeType: 'release',
	fetch: discogs.getRelease,
	merge: mergeReleaseDetails,
	errorMessage: 'Failed to load release details'
});

class GraphStore implements GraphStoreContext {
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
		return filterVisibleNodes(this.nodeList, this.visibleTypes, this.pinnedIds);
	}

	get visibleLinkList(): GraphLink[] {
		const visibleNodeIds = new Set(this.visibleNodeList.map((n) => n.id));

		return filterVisibleLinks(this.linkList, visibleNodeIds);
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

	updateRateLimit() {
		this.rateLimit = discogs.getLastRateLimit();
	}

	parseNodeId(id: string) {
		return parseNodeId(id);
	}

	applyPatch(patch: GraphPatch) {
		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		mergePatch(nextNodes, nextLinks, patch);

		this.nodes = nextNodes;
		this.links = nextLinks;
	}

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
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

	setLoading(id: string, isLoading: boolean) {
		const next = new Set(this.loading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.loading = next;
	}

	runLoad(nodeId: string, fn: () => Promise<void>, errorMessage: string) {
		return runLoad(this, nodeId, fn, errorMessage);
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

	private createDetailsCtx(
		getFetched: () => Set<string>,
		setFetched: (fetched: Set<string>) => void,
		getLoading: () => Set<string>,
		setLoadingSet: (loading: Set<string>) => void
	): DetailsTrackerContext {
		return {
			nodes: this.nodes,
			getError: () => this.error,
			setError: (error) => {
				this.error = error;
			},
			parseNodeId: (id) => this.parseNodeId(id),
			updateRateLimit: () => this.updateRateLimit(),
			setNodes: (nodes) => {
				this.nodes = nodes;
			},
			getFetched,
			setFetched,
			getLoading,
			setLoadingSet
		};
	}

	private artistDetailsCtx(): DetailsTrackerContext {
		return this.createDetailsCtx(
			() => this.artistDetailsFetched,
			(fetched) => {
				this.artistDetailsFetched = fetched;
			},
			() => this.artistDetailsLoading,
			(loading) => {
				this.artistDetailsLoading = loading;
			}
		);
	}

	private labelDetailsCtx(): DetailsTrackerContext {
		return this.createDetailsCtx(
			() => this.labelDetailsFetched,
			(fetched) => {
				this.labelDetailsFetched = fetched;
			},
			() => this.labelDetailsLoading,
			(loading) => {
				this.labelDetailsLoading = loading;
			}
		);
	}

	private masterDetailsCtx(): DetailsTrackerContext {
		return this.createDetailsCtx(
			() => this.masterDetailsFetched,
			(fetched) => {
				this.masterDetailsFetched = fetched;
			},
			() => this.masterDetailsLoading,
			(loading) => {
				this.masterDetailsLoading = loading;
			}
		);
	}

	private releaseDetailsCtx(): DetailsTrackerContext {
		return this.createDetailsCtx(
			() => this.releaseDetailsFetched,
			(fetched) => {
				this.releaseDetailsFetched = fetched;
			},
			() => this.releaseDetailsLoading,
			(loading) => {
				this.releaseDetailsLoading = loading;
			}
		);
	}

	markArtistDetailsFetched(nodeId: string) {
		artistDetailsTracker.markFetched(this.artistDetailsCtx(), nodeId);
	}

	async ensureArtistDetails(nodeId: string) {
		await artistDetailsTracker.ensure(this.artistDetailsCtx(), nodeId);
	}

	isArtistDetailsLoading(nodeId: string): boolean {
		return artistDetailsTracker.isLoading(this.artistDetailsCtx(), nodeId);
	}

	markLabelDetailsFetched(nodeId: string) {
		labelDetailsTracker.markFetched(this.labelDetailsCtx(), nodeId);
	}

	async ensureLabelDetails(nodeId: string) {
		await labelDetailsTracker.ensure(this.labelDetailsCtx(), nodeId);
	}

	isLabelDetailsLoading(nodeId: string): boolean {
		return labelDetailsTracker.isLoading(this.labelDetailsCtx(), nodeId);
	}

	async mergeMasterDetails(nodeId: string, master: import('$lib/discogs/types').Master) {
		await masterDetailsTracker.merge(this.masterDetailsCtx(), nodeId, master);
	}

	markMasterDetailsFetched(nodeId: string) {
		masterDetailsTracker.markFetched(this.masterDetailsCtx(), nodeId);
	}

	async ensureMasterDetails(nodeId: string) {
		await masterDetailsTracker.ensure(this.masterDetailsCtx(), nodeId);
	}

	isMasterDetailsLoading(nodeId: string): boolean {
		return masterDetailsTracker.isLoading(this.masterDetailsCtx(), nodeId);
	}

	async ensureReleaseDetails(nodeId: string) {
		await releaseDetailsTracker.ensure(this.releaseDetailsCtx(), nodeId);
	}

	isReleaseDetailsLoading(nodeId: string): boolean {
		return releaseDetailsTracker.isLoading(this.releaseDetailsCtx(), nodeId);
	}

	async search(query: string, type?: SearchType) {
		return searchStore(this, query, type, (searching) => {
			this.searching = searching;
		});
	}

	seedFromResult(result: SearchResult) {
		seedFromResult(this, result);
	}

	async seedFromNode(node: GraphNode) {
		await seedFromNode(this, node);
	}

	collapseNode(nodeId: string) {
		if (!this.expansionChildren.has(nodeId)) return;

		const descendants = collectDescendants(this.expansionChildren, nodeId);
		const toRemove = findRemovableDescendants(nodeId, descendants, this.linkList);

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
		return hasExpansionChildren(nodeId, this.expansionChildren, this.nodes);
	}

	loadRelatedArtists(nodeId: string) {
		return loadRelatedArtists(this, nodeId);
	}

	loadRelatedLabels(nodeId: string) {
		return loadRelatedLabels(this, nodeId);
	}

	loadRelatedCompanies(nodeId: string) {
		return loadRelatedCompanies(this, nodeId);
	}

	loadRelatedCreditedArtists(nodeId: string) {
		return loadRelatedCreditedArtists(this, nodeId);
	}

	loadReleases(nodeId: string) {
		return loadReleases(this, nodeId);
	}

	loadMasterReleases(nodeId: string) {
		return loadMasterReleases(this, nodeId);
	}

	loadMainRelease(nodeId: string) {
		return loadMainRelease(this, nodeId);
	}

	loadMoreReleases(nodeId: string) {
		return loadMoreReleases(this, nodeId);
	}

	hasMoreReleases(nodeId: string): boolean {
		return hasMoreReleases(this, nodeId);
	}

	loadMoreMasterReleases(nodeId: string) {
		return loadMoreMasterReleases(this, nodeId);
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		return hasMoreMasterReleases(this, nodeId);
	}

	isLoading(nodeId: string): boolean {
		return this.loading.has(nodeId);
	}
}

export const graphStore = new GraphStore();
