import type { GraphLink, GraphNode } from './types';

export function createNode(
	id: string,
	type: string,
	label: string,
	externalId: number
): GraphNode {
	return { id, type, label, externalId };
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
