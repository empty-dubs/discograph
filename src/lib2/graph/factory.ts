import type { GraphLink, GraphNode } from './types';

export function createNode(
	id: string,
	type: string,
	label: string
): GraphNode {
	return {id, type, label};
}

export function createLink(
	id: string,
	source: string,
	target: string,
	type: string,
	label?: string
): GraphLink {
	return {id, source, target, type, label};
}
