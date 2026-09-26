import { getRelatedNeighbors } from '$lib/graph/operations/crawlers';
import { releaseTitle, releaseListRowText } from './transformations';

import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode, NodeType } from '$lib/graph/types';

type ReleaseListItem = {
	key: string;
	label: string;
	query: string;
	discogsId?: number;
	searchType: 'release' | 'master';
	artists?: { id: number; name: string }[];
	meta?: { year?: number | string; genres?: string[]; styles?: string[] };
};

function parseYearForSort(node: GraphNode): number {
	const year = node.meta?.year;

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function collectLoadedReleaseNeighbors(
	node: GraphNode,
	graph: GraphInterface
): GraphNode[] {
	const nodeNeighborMap = new Map<string, GraphNode>();

	const { nodes: releaseIds } = getRelatedNeighbors(node, 'releases', graph);

	for (const id of releaseIds) {
		const neighbor = graph.data.nodes.get(id);

		if (neighbor) nodeNeighborMap.set(id, neighbor);
	}

	return [...nodeNeighborMap.values()];
}

export function isReleaseParentType(type: NodeType): type is 'artist' | 'label' | 'master' {
	return type === 'artist' || type === 'label' || type === 'master';
}

export function getReleaseListItems(
	node: GraphNode,
	graph: GraphInterface
): ReleaseListItem[] {
	if (!isReleaseParentType(node.type)) return [];

	return collectLoadedReleaseNeighbors(node, graph)
		.sort((a, b) => {
			const yearDiff = parseYearForSort(b) - parseYearForSort(a);

			if (yearDiff !== 0) return yearDiff;

			return releaseTitle(a).localeCompare(releaseTitle(b));
		})
		.map((neighbor): ReleaseListItem => {
			const { label, query } = releaseListRowText(neighbor);

			return {
				key: neighbor.id,
				label,
				query,
				discogsId: neighbor.discogsId ?? undefined,
				searchType: neighbor.type as 'release' | 'master',
				artists: neighbor.artists,
				meta: neighbor.meta,
			};
		});
}
