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
	parent: string,
	child: string,
	type: string,
	head?: string,
	tail?: string,
	label?: string,
): GraphLink {
	return {id, parent, child, type,head, tail, label};
}
