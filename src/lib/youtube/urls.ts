import type { GraphLink, GraphNode } from '$lib/graph/types';

const YOUTUBE_SEARCH_BASE = 'https://www.youtube.com/results';

export function resolveArtistDisplayName(
	node: GraphNode,
	links: GraphLink[],
	getNode: (id: string) => GraphNode | undefined
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

export function getYouTubeSearchUrl(
	node: Pick<GraphNode, 'type' | 'displayName' | 'meta'>,
	artistDisplayName?: string | null
): string | null {
	const parts: string[] = [node.displayName];

	if (node.type === 'artist') {
		parts.push('music');
	} else if (node.type === 'label') {
		parts.push('record label');
	} else if (node.type === 'release' || node.type === 'master') {
		if (artistDisplayName) parts.push(artistDisplayName);
		const year = node.meta?.year;
		if (year != null && year !== '') parts.push(String(year));
	}

	return `${YOUTUBE_SEARCH_BASE}?search_query=${encodeURIComponent(parts.join(' '))}`;
}
