import * as discogs from '$lib/discogs/client';

import { buildFromSearchResult } from '../builder';

import type { GraphNode } from '../types';
import type { SearchResult, SearchType } from '$lib/discogs/types';

import type { GraphStoreContext } from './types';

export async function searchStore(
	ctx: GraphStoreContext,
	query: string,
	type: SearchType | undefined,
	setSearching: (searching: boolean) => void
) {
	const trimmed = query.trim();

	if (!trimmed || ctx.searching || ctx.isRateLimited) return [];

	ctx.searchQuery = trimmed;
	ctx.searchType = type ?? '';
	ctx.error = null;
	setSearching(true);

	try {
		const response = await discogs.search(trimmed, type);

		ctx.updateRateLimit();
		ctx.searchResults = response.results;

		return response.results;
	} catch (err) {
		ctx.error = err instanceof Error ? err.message : 'Search failed';
		ctx.searchResults = [];
		return [];
	} finally {
		setSearching(false);
	}
}

export function seedFromResult(ctx: GraphStoreContext, result: SearchResult) {
	ctx.clearGraph();
	ctx.error = null;

	const patch = buildFromSearchResult(result);

	ctx.applyPatch(patch);

	const seedNodeId = patch.nodes[0]?.id;

	if (!seedNodeId) return;

	ctx.seedId = seedNodeId;
	ctx.selectedId = seedNodeId;
	ctx.clearSearchResults();
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
