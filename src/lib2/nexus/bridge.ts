import { graph } from '../graph/graph';
import { plugin as source } from '../plugins/discogs';
import { searchResultPatch } from './discogs/patches/searchResult';

import { defaultNodePresentation } from '../graph/presentation';
import { patchState } from './discogs/stores/patch-state.svelte';

import type { GraphNode } from '../graph/types';
import type { NodePresentation } from '../graph/presentation';
import type { SearchResult } from '../plugins/discogs';

export function clearSession() {
	source.stores.releasesStore.clear();
	source.stores.pagedDocumentStore.clear();
	source.stores.fetchState.clear();
	source.stores.documentStore.clear();
	source.stores.loadProgress.clear();
	patchState.clear();
	graph.clear();
}

export function nodePresentation(type: string): NodePresentation {
	const config = source.presentation.entities.find((entity) => entity.type === type);

	if (config) return { color: config.color, radius: config.radius };

	return defaultNodePresentation;
}

export function seedFromSearchResult(result: SearchResult) {
	if (source.isBlocked(result.type, result.id)) return;

	clearSession();

	const id = source.compositions.getEntityId(result.type, result.id);

	const patch = searchResultPatch(result);

	if (!patch.nodes[0]) return;

	graph.data.applyPatch(patch);
	graph.presentation.selectNode(id);
}

export function seedFromGraphNode(node: GraphNode) {
	clearSession();

	const patch = { nodes: [node], links: [] };

	graph.data.applyPatch(patch);
	graph.presentation.selectNode(node.id);
}
