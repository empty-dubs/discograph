import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';

import type { ParsedNodeId } from './types';

export function parseNodeId(id: string): ParsedNodeId {
	const [type, rawId] = id.split(':');

	if (!type || !rawId) return { type: 'artist', discogsId: null };

	const discogsId = Number(rawId);

	return {
		type: type as NodeType,
		discogsId: Number.isNaN(discogsId) ? null : discogsId
	};
}

export function filterVisibleNodes(
	nodes: GraphNode[],
	visibleTypes: Set<NodeType>,
	pinnedIds: Set<string>
): GraphNode[] {
	return nodes.filter((n) => visibleTypes.has(n.type) || pinnedIds.has(n.id));
}

export function filterVisibleLinks(links: GraphLink[], visibleNodeIds: Set<string>): GraphLink[] {
	return links.filter((l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target));
}

export function mergePatch(
	nodes: Map<string, GraphNode>,
	links: Map<string, GraphLink>,
	patch: GraphPatch
): void {
	for (const node of patch.nodes) {
		const existing = nodes.get(node.id);

		if (!existing) {
			nodes.set(node.id, node);
		} else {
			nodes.set(node.id, { ...existing, ...node, meta: { ...existing.meta, ...node.meta } });
		}
	}

	for (const link of patch.links) {
		links.set(link.id, link);
	}
}
