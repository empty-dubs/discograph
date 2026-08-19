import { API_BASE, API_SEGMENTS, DISCOGS_WEB_ORIGIN, WEB_SEGMENTS } from '$lib/discogs/constants';

import type { GraphLink, GraphNode } from '$lib/graph/types';

const YOUTUBE_SEARCH_BASE = 'https://www.youtube.com/results';

export function getDiscogsProxyUrl(node: GraphNode): string | null {
	if (node.discogsId === null) return null;

	return `${API_BASE}/${API_SEGMENTS[node.type]}/${node.discogsId}`;
}

export function getDiscogsWebsiteUrl(node: GraphNode): string | null {
	if (node.discogsId === null) return null;

	const path = node.uri ?? `/${WEB_SEGMENTS[node.type]}/${node.discogsId}`;

	if (path.startsWith(DISCOGS_WEB_ORIGIN)) return path;

	return `${DISCOGS_WEB_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function stripDiscogsDisambiguation(name: string): string {
	return name.replace(/\s*\(\d+\)$/, '').trim();
}

export function resolveArtistDisplayName(
	node: GraphNode,
	links: GraphLink[],
	getNode: (id: string | number) => GraphNode | undefined
): string | null {
	const stubArtist = (node as GraphNode & { artist?: string }).artist;
	if (stubArtist) return stubArtist;

	for (const link of links) {
		if (link.target !== node.id || link.type !== 'released') continue;
		const artist = getNode(link.source);
		if (artist?.type === 'artist') return artist.displayName;
	}

	return null;
}

export function getYouTubeSearchUrl(node: GraphNode, artistDisplayName?: string | null): string | null {
	const parts: string[] = [stripDiscogsDisambiguation(node.displayName)];

	if (node.type === 'artist') {
		parts.push('music');
	} else if (node.type === 'label') {
		parts.push('record label');
	} else if (node.type === 'release' || node.type === 'master') {
		if (artistDisplayName) parts.push(stripDiscogsDisambiguation(artistDisplayName));
		const year = node.meta?.year;
		if (year != null && year !== '') parts.push(String(year));
	}

	return `${YOUTUBE_SEARCH_BASE}?search_query=${encodeURIComponent(parts.join(' '))}`;
}
