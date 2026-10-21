import { graph } from '../../../../../graph/graph';
import { plugin as source } from '../../../../../plugins/discogs';

import type { EntityType, Master, Release } from '../../../../../plugins/discogs';
import type { SearchableListItem } from '../../../../shared/types';
import type { GraphLink, GraphNode } from '../../../../../graph/types';

const RELEASE_LINK_TYPES = new Set(['released', 'on_label', 'version_of']);

export function isReleaseParentType(type: string): boolean {
	return type === 'artist' || type === 'label' || type === 'master';
}

function getReleaseNeighborId(parent: GraphNode, link: GraphLink): string | null {
	if (parent.type === 'artist' && link.type === 'released' && link.source === parent.id) return link.target;

	if (parent.type === 'label' && link.type === 'on_label' && link.target === parent.id) return link.source;

	if (parent.type === 'master' && link.type === 'version_of' && link.target === parent.id) return link.source;

	return null;
}

export function hasReleaseListingData(nodeId: string): boolean {
	return (
		source.loadProgress.hasPagedDocument(nodeId, 'releases')
		|| source.loadProgress.hasPagedDocument(nodeId, 'master_releases')
	);
}

function collectReleaseNeighbors(parent: GraphNode): GraphNode[] {
	const nodeNeighborMap = new Map<string, GraphNode>();

	for (const link of graph.data.links.values()) {
		if (!RELEASE_LINK_TYPES.has(link.type)) continue;
		if (link.source !== parent.id && link.target !== parent.id) continue;

		const neighborId = getReleaseNeighborId(parent, link);

		if (!neighborId) continue;

		const neighbor = graph.data.nodes.get(neighborId);

		if (neighbor) nodeNeighborMap.set(neighbor.id, neighbor);
	}

	return [...nodeNeighborMap.values()];
}

function parseYearForSort(document: unknown): number {
	if (document == null || typeof document !== 'object' || !('year' in document)) {
		return Number.NEGATIVE_INFINITY;
	}

	const year = (document as { year?: number | string }).year;

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function listingTitle(neighbor: GraphNode, document: unknown): string {
	if (document != null && typeof document === 'object' && 'title' in document) {
		const title = (document as { title?: string }).title?.trim();

		if (title) return title;
	}

	return neighbor.label;
}

function neighborToListItem(neighbor: GraphNode): SearchableListItem {
	const entityType = neighbor.type as 'release' | 'master';
	const document = source.documentStore.get(neighbor.id);
	const title = listingTitle(neighbor, document);

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

		const { label, query } = source.compositions.releaseRowDisplay({ title, artist: artistName, year: meta?.year });

		return {
			key: neighbor.id,
			label,
			query,
			discogsId: neighbor.externalId,
			entityType,
			artists,
			meta
		};
	}

	return {
		key: neighbor.id,
		label: title,
		query: title,
		discogsId: neighbor.externalId,
		entityType: neighbor.type as EntityType
	};
}

export function getReleaseListItems(parent: GraphNode): SearchableListItem[] {
	if (!isReleaseParentType(parent.type)) return [];

	void source.loadProgress.pagedDocuments;
	void graph.data.links;
	void graph.data.nodes;
	void source.documentStore.documents;

	if (!hasReleaseListingData(parent.id)) return [];

	return collectReleaseNeighbors(parent)
		.sort((a, b) => {
			const yearDiff =
				parseYearForSort(source.documentStore.get(b.id))
				- parseYearForSort(source.documentStore.get(a.id));

			if (yearDiff !== 0) return yearDiff;

			return listingTitle(a, source.documentStore.get(a.id)).localeCompare(
				listingTitle(b, source.documentStore.get(b.id))
			);
		})
		.map((neighbor) => neighborToListItem(neighbor));
}
