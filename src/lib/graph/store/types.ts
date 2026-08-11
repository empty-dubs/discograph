import type { LoadAction } from '$lib/components/workspace/actions/constants';

import type { GraphLink, GraphNode, NodeType } from '../types';

import type { DetailStatus } from './details-store.svelte';
import type { GraphDataStore } from './data-store.svelte';
import type { GraphDisplayStore } from './display-store.svelte';
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
	readonly display: GraphDisplayStore;
	readonly expansion: ExpansionStore;
	readonly progress: ExpansionProgressStore;
	readonly details: DetailsStore;
	readonly nodes: Map<string, GraphNode>;
	readonly links: Map<string, GraphLink>;
	readonly nodeList: GraphNode[];
	readonly linkList: GraphLink[];
	readonly releasePages: Map<string, { page: number; pages: number }>;
	readonly masterReleasePages: Map<string, { page: number; pages: number }>;
	readonly loadedActions: Map<string, Set<LoadAction>>;

	clear(): void;
	collapseNode(nodeId: string): void;
	hasChildren(nodeId: string): boolean;
	hasMoreReleases(nodeId: string): boolean;
	hasMoreMasterReleases(nodeId: string): boolean;
	isDetailsLoading(nodeId: string): boolean;
	isDetailsFetched(nodeId: string): boolean;
	ensureArtistDetails(nodeId: string): Promise<void>;
	ensureLabelDetails(nodeId: string): Promise<void>;
	ensureMasterDetails(nodeId: string): Promise<void>;
	ensureReleaseDetails(nodeId: string): Promise<void>;
}
