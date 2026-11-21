import { RELEASES_TAB_LOAD_TYPES } from '../constants';
import { getEntityId } from '../compositions';
import { documentStore } from '../stores/documents.svelte';
import { pagedDocumentStore } from '../stores/paged-documents.svelte';
import { releasesStore } from '../stores/releases.svelte';

import type { EntityType, Master, NavigationPayload, PagedRelease } from '../types';

type ReleasePayload = {
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

function collectReleases(id: string): PagedRelease[] {
	const allReleases: PagedRelease[] = [];

	for (const loadType of RELEASES_TAB_LOAD_TYPES) {
		const releases = releasesStore.get(id, loadType);

		allReleases.push(...releases);
	}

	return allReleases;
}

function getReleaseTitle(release: PagedRelease): string {
	return release.title.trim() ?? 'Unknown release';
}

function getReleaseArtists(release: PagedRelease, parentId: string): string | undefined {
	if ('artist' in release) return release.artist;

	const parentDocument = documentStore.get(parentId) as Master;

	if ('artists' in parentDocument) return parentDocument.artists?.map((artist) => artist.name).join(' / ');

	return undefined;
}

function getReleaseYear(release: PagedRelease): string | number | undefined {
	return 'year' in release ? release.year
		: 'released' in release ? release.released
		: undefined;
}

function getReleaseYearForSort(release: PagedRelease): number {
	const year = getReleaseYear(release);

	if (year == null || year === '') return Number.NEGATIVE_INFINITY;

	const parsed = Number(year);

	return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

export function getReleaseNavigationLabel(release: ReleasePayload): string {
	const artistName = release.artist?.trim();
	const releaseCountry = release.country?.trim();
	const releaseFormat = release.format?.trim();
	const releaseTitle = release.title?.trim();
	const releaseYear = 
		release.year != null && release.year !== '' && release.year !== '0' && release.year !== 0
		? release.year
		: null;
	
	return `${artistName ? `${artistName} - ` : ''}${releaseTitle}${releaseCountry ? ` (${releaseCountry})` : ''}${releaseFormat ? ` (${releaseFormat})` : ''}${releaseYear ? ` (${releaseYear})` : ''}`;
}

function getReleaseNavigationPayload(id: string, release: PagedRelease): NavigationPayload {
	const entityType = 'type' in release && release.type === 'master' ? 'master' : 'release';
	const artistName = getReleaseArtists(release, id);
	const releaseTitle = getReleaseTitle(release);
	const releaseYear = getReleaseYear(release);

	const navigationKey = getEntityId(entityType, release.id);
	const navigationLabel = getReleaseNavigationLabel({
		title: releaseTitle,
		artist: artistName,
		year: releaseYear,
		country: 'country' in release ? release.country as string : undefined,
		format: 'format' in release ? release.format as string : undefined
	});

	return {
		key: navigationKey,
		label: navigationLabel,
		query: releaseTitle,
		externalId: release.id,
		entityType,
		artist: artistName,
		year: releaseYear
	};
}

export function getReleases(id: string, entityType: EntityType): NavigationPayload[] {
	if (!isReleaseParentType(entityType)) return [];
	if (!hasReleaseData(id)) return [];
	if (!documentStore.has(id)) return [];

	return collectReleases(id)
		.sort((a, b) => {
			const yearDiff = getReleaseYearForSort(b) - getReleaseYearForSort(a);

			if (yearDiff !== 0) return yearDiff;

			return getReleaseTitle(a).localeCompare(getReleaseTitle(b));
		})
		.map((release) => getReleaseNavigationPayload(id, release));
}

export function getTotalReleasesCount(id: string, entityType: EntityType): number | null {
	if (!id || !entityType) return null;

	if (!isReleaseParentType(entityType)) return null;

	for (const loadType of RELEASES_TAB_LOAD_TYPES) {
		const document = pagedDocumentStore.get(id, loadType);

		if (document?.pagination?.items != null) return document.pagination.items;
	}

	return null;
}
