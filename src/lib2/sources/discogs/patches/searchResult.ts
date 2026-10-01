import { nodeId, searchResultLabel } from './compositions';

import type { SearchResult } from '../types';
import type { GraphPatch } from '../../../graph/types';


export function searchResultPatch(result: SearchResult): GraphPatch {
	return {
		nodes: [
			{
				id: nodeId(result.type, result.id),
				type: result.type,
				label: searchResultLabel(result)
			}
		],
		links: []
	};
}
