import { graph } from '../graph/graph';
import { discogsPlugin as discogs } from '../plugins/discogs';
import { searchResultPatch } from './discogs/patches/searchResult';

import { defaultNodePresentation } from '../graph/presentation';

import type { GraphNode } from '../graph/types';
import type { NodePresentation } from '../graph/presentation';
import type { SearchResult } from '../plugins/discogs';

export function clearSession() {
	discogs.documentStore.clear();
	discogs.loadProgress.clear();
	graph.clear();
}

export function nodePresentation(type: string): NodePresentation {
	const config = discogs.presentation.entities.find((entity) => entity.type === type);

	if (config) return { color: config.color, radius: config.radius };

	return defaultNodePresentation;
}

export function seedFromSearchResult(result: SearchResult) {
	if (discogs.isBlocked(result.type, result.id)) return;

	clearSession();

	const id = discogs.compositions.getEntityId(result.type, result.id);

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