import { dev } from '$app/environment';

import type { SearchType } from './types';

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
	artist: new Set([194, 355]),
	label: new Set([1818])
};
