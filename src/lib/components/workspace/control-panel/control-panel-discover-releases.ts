import { releaseTitle, releaseListRowText } from './transformations';

import type { GraphInterface } from '$lib/graph/graph';
import type { GraphLink, GraphNode, NodeType } from '$lib/graph/types';

type DiscoverReleaseListItem = {
	key: string;
	label: string;
	query: string;
	discogsId?: number;
	searchType: 'release' | 'master';
};

function parseYearForSort(node: GraphNode): number {
	const year = node.meta?.year;

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function getLinkedNeighborId(parent: GraphNode, link: GraphLink): string | null {
	if (parent.type === 'artist') {
		if (link.type === 'released' && link.source === parent.id) return link.target;
	}

	if (parent.type === 'label') {
		if (link.type === 'on_label' && link.target === parent.id) return link.source;
	}

	if (parent.type === 'master') {
		if (link.type === 'version_of' && link.target === parent.id) return link.source;
	}

	return null;
}

function shouldIncludeNeighbor(
	parent: GraphNode,
	neighbor: GraphNode,
	graph: GraphInterface
): boolean {
	if (neighbor.type === 'release') {
		return graph.visitedNodes.releasePages.has(parent.id);
	}

	if (neighbor.type === 'master') {
		return (
			(parent.type === 'artist' || parent.type === 'label')
			&& graph.visitedNodes.masterReleasePages.has(parent.id)
		);
	}

	return false;
}

export function isReleaseParentType(type: NodeType): type is 'artist' | 'label' | 'master' {
	return type === 'artist' || type === 'label' || type === 'master';
}

export function getDiscoverReleaseListItems(
	parent: GraphNode,
	graph: GraphInterface
): DiscoverReleaseListItem[] {
	if (!isReleaseParentType(parent.type)) return [];

	const nodeNieghborMap = new Map<string, GraphNode>();

	for (const link of graph.data.linkList) {
		const neighborId = getLinkedNeighborId(parent, link);

		if (!neighborId) continue;

		const neighbor = graph.data.nodes.get(neighborId);

		if (!neighbor || (neighbor.type !== 'release' && neighbor.type !== 'master')) continue;
		if (!shouldIncludeNeighbor(parent, neighbor, graph)) continue;

		nodeNieghborMap.set(neighbor.id, neighbor);
	}

	return [...nodeNieghborMap.values()]
		.sort((a, b) => {
			const yearDiff = parseYearForSort(b) - parseYearForSort(a);

			if (yearDiff !== 0) return yearDiff;

			return releaseTitle(a).localeCompare(releaseTitle(b));
		})
		.map((neighbor): DiscoverReleaseListItem => {
			const { label, query } = releaseListRowText(neighbor);

			return {
				key: neighbor.id,
				label,
				query,
				discogsId: neighbor.discogsId ?? undefined,
				searchType: neighbor.type as 'release' | 'master'
			};
		});
}
