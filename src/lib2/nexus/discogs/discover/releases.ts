import { graph } from '../../../graph/graph';
import { plugin as source } from '../../../plugins/discogs';

import type { EntityType, Master, Release, SearchableListItem } from '../../../plugins/discogs';
import type { GraphNode } from '../../../graph/types';

function collectReleaseNeighbors(parent: GraphNode): GraphNode[] {
	const neighborIds = graph.expansion.parentChildAdjacencyList.get(parent.id);

	return [...(neighborIds ?? [])].filter((id) => id.includes('release') || id.includes('master')).map(id => graph.data.nodes.get(id)!);
}

function parseYearForSort(node: GraphNode): number {
	const document = source.documentStore.get(node.id);

	if (document == null || typeof document !== 'object' || !('year' in document)) {
		return Number.NEGATIVE_INFINITY;
	}

	const year = (document as { year?: number | string }).year;

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function listingTitle(neighbor: GraphNode): string {
	const document = source.documentStore.get(neighbor.id);

	if (document != null && typeof document === 'object' && 'title' in document) {
		const title = (document as { title?: string }).title?.trim();

		if (title) return title;
	}

	return neighbor.label;
}

function neighborToListItem(neighbor: GraphNode): SearchableListItem {
	const entityType = neighbor.type;
	const document = source.documentStore.get(neighbor.id);
	const title = listingTitle(neighbor);

	let artistName: string | undefined;
	let meta: SearchableListItem['meta'];

	if (entityType === 'release' || entityType === 'master') {
		const doc = document as Release | Master | undefined;
		const artists = doc?.artists?.map((artist) => ({ id: artist.id, name: artist.name }));

		artistName = artists?.[0]?.name;

		if (doc && ('year' in doc || 'genres' in doc || 'styles' in doc)) {
			meta = {
				year: doc.year,
				genres: doc.genres,
				styles: doc.styles
			};
		}

		const { label, query } = source.compositions.releaseRowDisplay({
			title,
			artist: artistName,
			year: meta?.year
		});

		return {
			key: neighbor.id,
			label,
			query,
			externalId: neighbor.externalId,
			entityType,
			artists,
			meta
		};
	}

	return {
		key: neighbor.id,
		label: title,
		query: title,
		externalId: neighbor.externalId,
		entityType: neighbor.type as EntityType
	};
}

export function getReleaseListItems(parent: GraphNode): SearchableListItem[] {
	if (!source.relatedEntities.isReleaseParentType(parent.type)) return [];

	void source.loadProgress.pagination;
	void source.documentStore.documents;

	if (!source.loadProgress.hasPagedDocument(parent.id, 'releases')
		&& !source.loadProgress.hasPagedDocument(parent.id, 'master_releases')) return [];

	return collectReleaseNeighbors(parent)
		.sort((a, b) => {
			const yearDiff =
				parseYearForSort(b)
				- parseYearForSort(a);

			if (yearDiff !== 0) return yearDiff;

			return listingTitle(a).localeCompare(
				listingTitle(b)
			);
		})
		.map((neighbor) => neighborToListItem(neighbor));
}
