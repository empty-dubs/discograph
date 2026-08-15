import type { GraphNode, NodeType } from '../types';
import type { GraphInterface } from '$lib/graph/graph';

export type DetailStatus = 'idle' | 'loading' | 'fetched';

export type EntityMergeFn<T> = (
	node: GraphNode,
	graph: GraphInterface,
	entity: T
) => void | Promise<void>;

export interface DetailsConfig<T> {
	nodeType: NodeType;
	fetch: (id: number) => Promise<T>;
	merge: EntityMergeFn<T>;
	errorMessage: string;
}
