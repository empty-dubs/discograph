import type { GraphNode, NodeType } from '../types';

export type DetailStatus = 'idle' | 'loading' | 'fetched';

export interface DetailsTrackerContext {
	readonly nodes: Map<string, GraphNode>;
	setNodes(nodes: Map<string, GraphNode>): void;
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
	markFetched(ctx: DetailsTrackerContext, nodeId: string): void;
	merge(ctx: DetailsTrackerContext, nodeId: string, entity: T): Promise<void>;
}
