import type { EdgeType, NodeType } from '../types';

export function nodeId(type: NodeType, id: number | string): string {
	return `${type}:${id}`;
}

export function linkId(source: string, type: EdgeType, target: string): string {
	return `${source}|${type}|${target}`;
}
