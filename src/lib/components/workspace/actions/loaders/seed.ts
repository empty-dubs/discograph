import { discogsApi } from '$lib/discogs/discogs.svelte';
import { buildFromSearchResult } from '$lib/graph/operations/patches/search';

import type { SearchResult } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode } from '$lib/graph/types';

export function seedFromResult(graph: GraphInterface, result: SearchResult) {
	graph.clear();
	discogsApi.clear();

	const patch = buildFromSearchResult(result);

	graph.data.applyPatch(patch);

	const seedNodeId = patch.nodes[0]?.id;

	if (!seedNodeId) return;

	graph.display.selectedId = seedNodeId;
}

export async function seedFromNode(graph: GraphInterface, node: GraphNode) {
	if (node.discogsId === null) return;

	seedFromResult(graph, {
		id: node.discogsId,
		type: node.type,
		name: node.type === 'artist' || node.type === 'label' ? node.displayName : undefined,
		title: node.type === 'release' || node.type === 'master' ? node.displayName : undefined,
		uri: node.uri
	});
}
