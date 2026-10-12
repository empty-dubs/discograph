import { dev } from '$app/environment';

import type { LoadType, SearchType } from './types';

export const DISCOGS_WEB_ORIGIN = 'https://www.discogs.com';
export const DISCOGS_API_ORIGIN = 'https://api.discogs.com';

export const API_BASE = dev ? '/api/discogs' : DISCOGS_API_ORIGIN;

export const API_SEGMENTS: Record<SearchType, string> = {
	artist: 'artists',
	label: 'labels',
	release: 'releases',
	master: 'masters'
};

export const WEB_SEGMENTS: Record<SearchType, string> = {
	artist: 'artist',
	label: 'label',
	release: 'release',
	master: 'master'
};

export const BLOCKED_DISCOGS_IDS: Partial<Record<SearchType, ReadonlySet<number>>> = {
	artist: new Set([0, 194, 355]),
	label: new Set([1818])
};

export const LOAD_TYPES: Record<SearchType, LoadType[]> = {
	artist: ['artists', 'aliases', 'releases', 'master_releases'],
	label: ['labels', 'releases'],
	release: ['artists', 'labels', 'companies', 'credited_artists', 'linked_master'],
	master: ['artists', 'releases', 'main_release']
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
