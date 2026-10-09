import { graph } from '../graph/graph';
import { discogsPlugin as discogs } from '../plugins/discogs';
import { searchResultPatch } from './discogs/patches/searchResult';

import { defaultNodePresentation } from '../graph/presentation';

import type { NodePresentation } from '../graph/presentation';
import type { SearchResult } from '../plugins/discogs';

export function nodePresentation(type: string): NodePresentation {
	const config = discogs.presentation.nodes.find((entry) => entry.id === type);

	if (config) return { color: config.color, radius: config.radius };

	return defaultNodePresentation;
}

/** Entity write → graph patch → selection (keep synchronous; no await between steps). */
export function seedFromSearchResult(result: SearchResult) {
	if (discogs.isBlocked(result.type, result.id)) return;

	discogs.documentStore.clear();
	graph.clear();

	const id = discogs.compositions.nodeId(result.type, result.id);

	discogs.documentStore.set(id, result);

	const patch = searchResultPatch(result);

	if (!patch.nodes[0]) return;

	graph.data.applyPatch(patch);
	graph.presentation.selectNode(id);
}
