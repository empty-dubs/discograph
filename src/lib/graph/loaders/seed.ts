import { discogsApiStore } from '$lib/discogs/api-store.svelte';
import { graph } from '$lib/graph/store/graph.svelte';
import { buildFromSearchResult } from '../operations/patches/search';

import type { SearchResult } from '$lib/discogs/types';
import type { GraphContext } from '../store/graph.svelte';
import type { GraphNode } from '../types';

export function seedFromResult(ctx: GraphContext, result: SearchResult) {
	graph.clear();
	discogsApiStore.clear();

	const patch = buildFromSearchResult(result);

	ctx.data.applyPatch(patch);

	const seedNodeId = patch.nodes[0]?.id;

	if (!seedNodeId) return;

	ctx.ui.seedId = seedNodeId;
	ctx.ui.selectedId = seedNodeId;
}

export async function seedFromNode(ctx: GraphContext, node: GraphNode) {
	if (node.discogsId === null) return;

	seedFromResult(ctx, {
		id: node.discogsId,
		type: node.type,
		name: node.type === 'artist' || node.type === 'label' ? node.displayName : undefined,
		title: node.type === 'release' || node.type === 'master' ? node.displayName : undefined,
		uri: node.discogsUrl
	});
}
