import { plugin as source } from '../../../plugins/discogs';
import { createNode } from '../../../graph/factory';

import type { GraphPatch } from '../../../graph/types';
import type { SearchResult } from '../../../plugins/discogs';

export function searchResultPatch(result: SearchResult): GraphPatch {
	const type = result.type;

	return {
		nodes: [
			createNode(
				source.compositions.getEntityId(type, result.id),
				type,
				source.transformations.entityLabel(result),
				result.id
			)
		],
		links: []
	};
}
