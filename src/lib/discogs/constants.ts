import type { NodeType } from '$lib/graph/types';

export const DISCOGS_WEB_ORIGIN = 'https://www.discogs.com';
export const DISCOGS_API_ORIGIN = 'https://api.discogs.com';

export const API_BASE = '/api/discogs';

export const API_SEGMENTS: Record<Exclude<NodeType, 'track'>, string> = {
	artist: 'artists',
	label: 'labels',
	release: 'releases',
	master: 'masters'
};

export const WEB_SEGMENTS: Record<Exclude<NodeType, 'track'>, string> = {
	artist: 'artist',
	label: 'label',
	release: 'release',
	master: 'master'
};
