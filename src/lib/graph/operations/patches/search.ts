import type { SearchResult } from '$lib/discogs/types';

import type { GraphNode, GraphPatch} from '../../types';

import { createArtistNode, createLabelNode, createMasterNode, createReleaseNode } from './nodes';

type SearchResultBuilder = (result: SearchResult) => GraphNode;

const searchResultBuilders: Record<string, SearchResultBuilder> = {
	artist: (result) => createArtistNode(result),
	label: (result) => createLabelNode(result),
	master: (result) => createMasterNode(result, { year: result.year }),
	release: (result) => createReleaseNode(result, { year: result.year })
};

export function buildFromSearchResult(result: SearchResult): GraphPatch {
	try {
		const buildNode = searchResultBuilders[result.type];
		return { nodes: [buildNode(result)], links: [] };
	} catch (error) {
		console.error(error);
		return { nodes: [], links: [] };
	}
}
