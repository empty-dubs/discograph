import type {
	SearchResult,
	SearchType
} from '$lib/discogs/types';

import type { GraphNode, GraphPatch} from '../../types';

import { artistNode, labelNode, masterNode, releaseNode } from './nodes';

type SearchResultBuilder = (result: SearchResult) => GraphNode;

const searchResultBuilders: Record<string, SearchResultBuilder> = {
	artist: (result) => artistNode(result),
	label: (result) => labelNode(result),
	master: (result) => masterNode(result, { year: result.year }),
	release: (result) => releaseNode(result, { year: result.year })
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
