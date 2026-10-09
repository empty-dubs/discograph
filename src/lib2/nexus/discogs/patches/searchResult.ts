import { discogsPlugin as discogs } from '../../../plugins/discogs';
import { createNode } from '../../../graph/factory';

import type { GraphPatch } from '../../../graph/types';
import type { SearchResult } from '../../../plugins/discogs';

export function searchResultPatch(result: SearchResult): GraphPatch {
	const type = result.type;

	return {
		nodes: [
			createNode(
				discogs.compositions.nodeId(type, result.id),
				type,
				discogs.transformations.entityLabel(result),
				result.id
			)
		],
		links: []
	};
}
