import type { GraphLink, GraphNode, GraphPatch } from '../types';

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
