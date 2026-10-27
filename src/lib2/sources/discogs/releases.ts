import { RELEASES_TAB_LOAD_TYPES } from './constants';
import { getEntityId } from './compositions';
import { documentStore } from './stores/document-store.svelte';
import { releasesStore } from './stores/releases-store.svelte';

import type { EntityType, Master, PagedReleaseItem, SearchableListItem } from './types';

type ReleaseItemPayload = {
	title: string;
	artist?: string;
	year?: number | string;
	country?: string;
	format?: string;
}

export function hasReleaseData(id: string): boolean {
	return (
		releasesStore.get(id, 'releases').length > 0
		|| releasesStore.get(id, 'master_releases').length > 0
	);
}

export function isReleaseParentType(type: string): boolean {
	return type === 'artist' || type === 'label' || type === 'master';
}

function collectReleases(id: string): PagedReleaseItem[] {
	const allReleases: PagedReleaseItem[] = [];

	for (const loadType of RELEASES_TAB_LOAD_TYPES) {
		const releases = releasesStore.get(id, loadType);

		allReleases.push(...releases);
	}

	return allReleases;
}

function getReleaseTitle(releaseItem: PagedReleaseItem): string {
	return releaseItem.title.trim() ?? 'Unknown release';
}

function getReleaseArtists(releaseItem: PagedReleaseItem, parentId: string): string | undefined {
	if ('artist' in releaseItem) return releaseItem.artist;

	const parentDocument = documentStore.get(parentId) as Master;

	if ('artists' in parentDocument) return parentDocument.artists?.map((artist) => artist.name).join(' / ');

	return undefined;
}

function getReleaseYear(releaseItem: PagedReleaseItem): string | number | undefined {
	return 'year' in releaseItem ? releaseItem.year
		: 'released' in releaseItem ? releaseItem.released
		: undefined;
}

function getReleaseYearForSort(releaseItem: PagedReleaseItem): number {
	const year = getReleaseYear(releaseItem);

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

export function getReleaseItemLabel(payload: ReleaseItemPayload): string {
	const artistName = payload.artist?.trim();
	const releaseCountry = payload.country?.trim();
	const releaseFormat = payload.format?.trim();
	const releaseTitle = payload.title?.trim();
	const releaseYear = 
		payload.year != null && payload.year !== '' && payload.year !== '0' && payload.year !== 0
		? payload.year
		: null;
	
	return `${artistName ? `${artistName} - ` : ''}${releaseTitle}${releaseYear ? ` (${releaseYear})` : ''}${releaseCountry ? ` (${releaseCountry})` : ''}${releaseFormat ? ` (${releaseFormat})` : ''}`;
}

function getReleaseListItem(id: string, item: PagedReleaseItem): SearchableListItem {
	const entityType = 'type' in item && item.type === 'master' ? 'master' : 'release';

	const entityId = getEntityId(entityType, item.id);
	const artistName = getReleaseArtists(item, id);
	const releaseTitle = getReleaseTitle(item);
	const releaseYear = getReleaseYear(item);

	const label = getReleaseItemLabel({
		title: releaseTitle,
		artist: artistName,
		year: releaseYear,
		country: 'country' in item ? item.country as string : undefined,
		format: 'format' in item ? item.format as string : undefined
	});

	return {
		key: entityId,
		label,
		query: releaseTitle,
		externalId: item.id,
		entityType,
		artist: artistName,
		year: releaseYear
	};
}

export function getReleaseListItems(id: string, entityType: EntityType): SearchableListItem[] {
	if (!isReleaseParentType(entityType)) return [];
	if (!hasReleaseData(id)) return [];
	if (!documentStore.has(id)) return [];

	return collectReleases(id)
		.sort((a, b) => {
			const yearDiff = getReleaseYearForSort(b) - getReleaseYearForSort(a);

			if (yearDiff !== 0) return yearDiff;

			return getReleaseTitle(a).localeCompare(getReleaseTitle(b));
		})
		.map((item) => getReleaseListItem(id, item));
}
