import type { GraphNode, NodeType } from '../types';

import type { DetailStatus } from './NodeDetailsState.svelte';

export interface ParsedNodeId {
	type: NodeType;
	discogsId: number | null;
}

export interface DetailsTrackerContext {
	readonly nodes: Map<string, GraphNode>;
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
