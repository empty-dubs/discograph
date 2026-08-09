import { discogsApiStore } from '$lib/discogs/api-store.svelte';

import { buildFromSearchResult } from '../builder/patches';

import type { GraphNode } from '../types';
import type { SearchResult } from '$lib/discogs/types';

import type { GraphContext } from '../store/graph-store.svelte';

export function resetGraph(ctx: GraphContext) {
	ctx.data.clear();
	ctx.expansion.clear();
	ctx.progress.clear();
	ctx.details.clear();
	ctx.ui.clear();
	discogsApiStore.clearError();
	discogsApiStore.clearSearchResults();
}

export function seedFromResult(ctx: GraphContext, result: SearchResult) {
	resetGraph(ctx);

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
