import { BLOCKED_DISCOGS_IDS, DISCOGS_WEB_ORIGIN, DISCOGS_WEB_SEGMENTS, YOUTUBE_SEARCH_BASE } from './constants';

import type { EntityType } from './types';

type YouTubeSearchPayload = {
	label?: string;
	query?: string;
	entityType?: EntityType;
	artists?: { id: number; name: string }[];
	meta?: { year?: number | string };
};

export function getEntityId(type: string, externalId: number | string): string {
	return `discogs:${type}:${externalId}`;
}

export function getRelationshipId(source: string, type: string, target: string): string {
	return `${source}|${type}|${target}`;
}

function stripDiscogsDisambiguation(name: string): string {
	return name.replace(/\s*\(\d+\)$/, '').trim();
}

export function getDiscogsWebsiteUrl(type: EntityType, externalId: number): string | undefined {
	if (!externalId || !type) return undefined;

	return `${DISCOGS_WEB_ORIGIN}/${DISCOGS_WEB_SEGMENTS[type]}/${externalId}`;
}

export function getYouTubeSearchUrl(payload: YouTubeSearchPayload): string | undefined {
	const displayName = stripDiscogsDisambiguation((payload.query ?? payload.label ?? '').trim());

	if (!displayName) return undefined;

	const parts: string[] = [displayName];

	if (payload.entityType === 'artist') {
		parts.push('music');
	} else if (payload.entityType === 'label') {
		parts.push('record label');
	} else if (payload.entityType === 'release' || payload.entityType === 'master') {
		const artist = payload.artists?.[0];
		const year = payload.meta?.year;

		if (artist?.name && artist.id && !BLOCKED_DISCOGS_IDS['artist']?.has(artist.id)) {
			parts.unshift(stripDiscogsDisambiguation(artist.name));
		}

		if (year != null && year !== '' && year !== '0') parts.push(String(year));
	}

	return `${YOUTUBE_SEARCH_BASE}?search_query=${encodeURIComponent(parts.join(' '))}`;
}
