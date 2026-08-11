import type { LoadAction } from '$lib/components/workspace/actions/constants';
import type { Master, SearchResult } from '$lib/discogs/types';

import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';

import type { DetailStatus } from './details-store.svelte';
import type { GraphDataStore } from './data-store.svelte';
import type { GraphUiStore } from './ui-store.svelte';
import type { ExpansionStore } from './expansion-store.svelte';
import type { ExpansionProgressStore } from './expansion-progress-store.svelte';
import type { DetailsStore } from './details-store.svelte';

export interface ParsedNodeId {
	type: NodeType;
	discogsId: number | null;
}

export interface DetailsTrackerContext {
	readonly nodes: Map<string, GraphNode>;
	parseNodeId(id: string): ParsedNodeId;
	setNodes(nodes: Map<string, GraphNode>): void;
	isFetched(nodeId: string): boolean;
	isLoading(nodeId: string): boolean;
	setStatus(nodeId: string, status: DetailStatus): void;
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

export interface GraphInterface {
	readonly data: GraphDataStore;
	readonly ui: GraphUiStore;
	readonly expansion: ExpansionStore;
	readonly progress: ExpansionProgressStore;
	readonly details: DetailsStore;
	readonly nodes: Map<string, GraphNode>;
	readonly links: Map<string, GraphLink>;
	readonly nodeList: GraphNode[];
	readonly linkList: GraphLink[];
	readonly visibleNodeList: GraphNode[];
	readonly visibleLinkList: GraphLink[];
	readonly typeCounts: Record<NodeType, number>;
	readonly selectedNode: GraphNode | null;
	readonly selectedId: string | null;
	readonly seedId: string | null;
	readonly visibleTypes: Set<NodeType>;
	readonly viewResetToken: number;
	readonly showNodeLabels: boolean;
	readonly releasePages: Map<string, { page: number; pages: number }>;
	readonly masterReleasePages: Map<string, { page: number; pages: number }>;
	readonly loadedActions: Map<string, Set<LoadAction>>;

	parseNodeId(id: string): ParsedNodeId;
	applyPatch(patch: GraphPatch): void;
	clear(): void;
	selectNode(id: string | null): void;
	isTypeVisible(type: NodeType): boolean;
	toggleType(type: NodeType): void;
	toggleNodeLabels(): void;
	collapseNode(nodeId: string): void;
	hasChildren(nodeId: string): boolean;
	isLoading(nodeId: string): boolean;
	hasMoreReleases(nodeId: string): boolean;
	hasMoreMasterReleases(nodeId: string): boolean;
	hasLoadedAction(
		nodeId: string,
		action: LoadAction
	): boolean;
	isDetailsLoading(nodeId: string): boolean;
	isDetailsFetched(nodeId: string): boolean;
	ensureArtistDetails(nodeId: string): Promise<void>;
	ensureLabelDetails(nodeId: string): Promise<void>;
	ensureMasterDetails(nodeId: string): Promise<void>;
	ensureReleaseDetails(nodeId: string): Promise<void>;
	mergeMasterDetails(nodeId: string, master: Master): Promise<void>;
}
