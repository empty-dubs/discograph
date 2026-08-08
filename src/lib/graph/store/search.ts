import { discogsApiStore } from '$lib/discogs/api.svelte';

import { buildFromSearchResult } from '../builder';

import type { GraphNode } from '../types';
import type { SearchResult } from '$lib/discogs/types';

import type { GraphStoreContext } from './types';

export function seedFromResult(ctx: GraphStoreContext, result: SearchResult) {
	ctx.clearGraph();
	discogsApiStore.clearError();

	const patch = buildFromSearchResult(result);

	ctx.applyPatch(patch);

	const seedNodeId = patch.nodes[0]?.id;

	if (!seedNodeId) return;

	ctx.seedId = seedNodeId;
	ctx.selectedId = seedNodeId;
	discogsApiStore.clearSearchResults();
}

export async function seedFromNode(ctx: GraphStoreContext, node: GraphNode) {
	if (node.discogsId === null) return;

	seedFromResult(ctx, {
		id: node.discogsId,
		type: node.type,
		name: node.type === 'artist' || node.type === 'label' ? node.displayName : undefined,
		title: node.type === 'release' || node.type === 'master' ? node.displayName : undefined,
		uri: node.discogsUrl
	});
}
