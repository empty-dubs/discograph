import type { GraphLink, GraphNode, NodeType } from '../types';

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
