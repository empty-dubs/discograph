import { discogsPlugin as discogs } from '../../../plugins/discogs';

import type { GraphPatch } from '../../../graph/types';
import type { SearchResult} from '../../../plugins/discogs';

export function searchResultPatch(result: SearchResult): GraphPatch {
	return {
		nodes: [
			{
				id: discogs.compositions.nodeId(result.type, result.id),
				type: result.type,
				label: discogs.transformations.entityLabel(result)
			}
		],
		links: []
	};
}
