import type { Label } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode } from '$lib/graph/types';

export function mergeLabelDetails(node: GraphNode, graph: GraphInterface, label: Label) {
	if (!node) return;

	const next = new Map(graph.data.nodes);

	next.set(node.id, {
		...node,
		profile: label.profile,
		urls: label.urls ?? [],
		parent_label: label.parent_label ?? undefined,
		sublabels: label.sublabels?.map(({ id, name }) => ({ id, name })) ?? []
	});

	graph.data.nodes = next;
}