import { graph } from '../../graph/graph';
import { BLOCKED_DISCOGS_IDS } from './constants';
import { documentStore } from './document-store.svelte';
import { searchResultPatch } from './patches/searchResult';

import type { SearchResult, SearchType } from './types';

export function isBlocked(type: SearchType, id: number): boolean {
	return BLOCKED_DISCOGS_IDS[type]?.has(id) ?? false;
}

export function seedFromResult(result: SearchResult) {
	if (isBlocked(result.type, result.id)) return;

	graph.clear();
	documentStore.clear();

	const patch = searchResultPatch(result);

	const node = patch.nodes[0];

	if (!node) return;

	documentStore.set(node.id, result);
	graph.data.applyPatch(patch);
	graph.presentation.selectNode(node.id);
}
