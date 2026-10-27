import { DISCOGS_WEB_ORIGIN, DISCOGS_WEB_SEGMENTS, YOUTUBE_SEARCH_BASE } from './constants';

import type { EntityType } from './types';

type YouTubeSearchPayload = {
	query?: string;
	entityType?: EntityType;
	artist?: string;
	year?: number | string;
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
	const displayName = stripDiscogsDisambiguation((payload.query ?? '').trim());

	if (!displayName) return undefined;

	const parts: string[] = [displayName];

	if (payload.entityType === 'artist') {
		parts.push('music');
	} else if (payload.entityType === 'label') {
		parts.push('record label');
	} else if (payload.entityType === 'release' || payload.entityType === 'master') {
		if (payload.artist) {
			parts.unshift(stripDiscogsDisambiguation(payload.artist));
		}

		if (payload.year != null && payload.year !== '' && payload.year !== '0' && payload.year !== 0) {
			parts.push(String(payload.year));
		}
	}

	return `${YOUTUBE_SEARCH_BASE}?search_query=${encodeURIComponent(parts.join(' '))}`;
}
