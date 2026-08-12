import { discogsApi } from '$lib/discogs/discogs.svelte';
import { buildFromSearchResult } from '../operations/patches/search';

import type { SearchResult } from '$lib/discogs/types';
import type { GraphInterface } from '../stores/graph.svelte';
import type { GraphNode } from '../types';

export function seedFromResult(graph: GraphInterface, result: SearchResult) {
	graph.clear();
	discogsApi.clear();

	const patch = buildFromSearchResult(result);

	graph.data.applyPatch(patch);

	const seedNodeId = patch.nodes[0]?.id;

	if (!seedNodeId) return;

	graph.display.seedId = seedNodeId;
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
