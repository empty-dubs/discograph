import { dev } from '$app/environment';

import type { EntityType, LoadType } from './types';

export const DISCOGS_API_ORIGIN = 'https://api.discogs.com';
export const DISCOGS_WEB_ORIGIN = 'https://www.discogs.com';
export const YOUTUBE_SEARCH_BASE = 'https://www.youtube.com/results';

export const API_BASE = dev ? '/api/discogs' : DISCOGS_API_ORIGIN;

export const DISCOGS_API_SEGMENTS: Record<EntityType, string> = {
	artist: 'artists',
	label: 'labels',
	release: 'releases',
	master: 'masters'
};

export const DISCOGS_WEB_SEGMENTS: Record<EntityType, string> = {
	artist: 'artist',
	label: 'label',
	release: 'release',
	master: 'master'
};

export const BLOCKED_DISCOGS_IDS: Record<EntityType, ReadonlySet<number>> = {
	artist: new Set([0, 194, 355]),
	label: new Set([1818]),
	release: new Set(),
	master: new Set()
};

export const ENTITY_NEIGHBOR_TYPES: Record<EntityType, LoadType[]> = {
	artist: ['artists', 'aliases', 'releases', 'master_releases'],
	label: ['labels', 'releases'],
	release: ['artists', 'labels', 'companies', 'credited_artists', 'linked_master'],
	master: ['artists', 'releases', 'main_release']
};

export const RELATED_ENTITY_TYPE_MAP: Record<LoadType, EntityType> = {
	artists: 'artist',
	aliases: 'artist',
	labels: 'label',
	releases: 'release',
	master_releases: 'master',
	main_release: 'release',
	linked_master: 'master',
	companies: 'label',
	credited_artists: 'artist'
};

export const PATCH_LOAD_TYPES = new Set<LoadType>([
	'artists',
	'labels',
	'aliases',
	'companies',
	'credited_artists',
	'main_release',
	'linked_master'
]);

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
	artists: 'Load related artists',
	aliases: 'Load artist aliases',
	labels: 'Load related labels',
	releases: 'Load releases',
	master_releases: 'Load master releases',
	main_release: 'Load main release',
	linked_master: 'Load linked master',
	companies: 'Load related companies',
	credited_artists: 'Load credited artists'
};

export const ARTIST_LOAD_TYPES: LoadType[] = ['artists', 'aliases', 'credited_artists'];
export const LABEL_LOAD_TYPES: LoadType[] = ['labels', 'companies'];
export const MASTER_RELEASE_LOAD_TYPES: LoadType[] = ['master_releases', 'releases', 'main_release', 'linked_master'];
export const RELEASES_TAB_LOAD_TYPES: LoadType[] = ['master_releases', 'releases'];

export const ARTIST_GROUPS = ['artist'];
export const MASTER_RELEASE_GROUPS = ['master', 'release'];
export const LABEL_GROUPS = ['label'];
