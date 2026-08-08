import type { SearchResult, SearchType } from '$lib/discogs/types';

import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';

export interface ParsedNodeId {
	type: NodeType;
	discogsId: number | null;
}

export interface GraphStoreContext {
	nodes: Map<string, GraphNode>;
	links: Map<string, GraphLink>;
	loading: Set<string>;
	releasePages: Map<string, { page: number; pages: number }>;
	masterReleasePages: Map<string, { page: number; pages: number }>;
	expanded: Set<string>;
	expansionChildren: Map<string, Set<string>>;
	seedId: string | null;
	selectedId: string | null;

	readonly linkList: GraphLink[];

	parseNodeId(id: string): ParsedNodeId;
	applyPatch(patch: GraphPatch): void;
	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch): void;
	runLoad(nodeId: string, fn: () => Promise<void>, errorMessage: string): Promise<void>;
	setLoading(id: string, isLoading: boolean): void;
	clearGraph(): void;
	markArtistDetailsFetched(nodeId: string): void;
	markLabelDetailsFetched(nodeId: string): void;
	mergeMasterDetails(nodeId: string, master: import('$lib/discogs/types').Master): Promise<void>;
	markMasterDetailsFetched(nodeId: string): void;
}

export interface DetailsTrackerContext {
	readonly nodes: Map<string, GraphNode>;
	parseNodeId(id: string): ParsedNodeId;
	setNodes(nodes: Map<string, GraphNode>): void;
	getFetched(): Set<string>;
	setFetched(fetched: Set<string>): void;
	getLoading(): Set<string>;
	setLoadingSet(loading: Set<string>): void;
}

export type EntityMergeFn<T> = (
	ctx: DetailsTrackerContext,
	nodeId: string,
	entity: T
) => void | Promise<void>;

export interface DetailsTrackerConfig<T> {
	nodeType: NodeType;
	fetch: (id: number) => Promise<T>;
	merge: EntityMergeFn<T>;
	errorMessage: string;
}

export interface DetailsTracker<T> {
	ensure(ctx: DetailsTrackerContext, nodeId: string): Promise<void>;
	isLoading(ctx: DetailsTrackerContext, nodeId: string): boolean;
	markFetched(ctx: DetailsTrackerContext, nodeId: string): void;
	merge(ctx: DetailsTrackerContext, nodeId: string, entity: T): Promise<void>;
}
