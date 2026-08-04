import { API_BASE, API_SEGMENTS, DISCOGS_WEB_ORIGIN, WEB_SEGMENTS } from './constants';

import type { GraphNode } from '$lib/graph/types';

export function getDiscogsProxyUrl(node: Pick<GraphNode, 'type' | 'discogsId'>): string | null {
	if (node.discogsId === null) return null;

	return `${API_BASE}/${API_SEGMENTS[node.type]}/${node.discogsId}`;
}

export function getDiscogsWebsiteUrl(
	node: Pick<GraphNode, 'type' | 'discogsId' | 'discogsUrl'>
): string | null {
	if (node.discogsUrl) return node.discogsUrl;
	if (node.discogsId === null) return null;

	return `${DISCOGS_WEB_ORIGIN}/${WEB_SEGMENTS[node.type]}/${node.discogsId}`;
}
