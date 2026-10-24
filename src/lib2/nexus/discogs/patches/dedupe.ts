import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function dedupePatch(patch: GraphPatch): GraphPatch {
	const links: GraphLink[] = [];
	const nodes: GraphNode[] = [];
	const knownLinkIds = new Set<string>();
	const knownNodeIds = new Set<string>();

	for (const node of patch.nodes) {
		if (knownNodeIds.has(node.id)) continue;

		knownNodeIds.add(node.id);
		nodes.push(node);
	}

	for (const link of patch.links) {
		if (knownLinkIds.has(link.id)) continue;

		knownLinkIds.add(link.id);
		links.push(link);
	}

	return { nodes, links };
}
