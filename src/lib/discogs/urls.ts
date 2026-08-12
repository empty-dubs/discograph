import { API_BASE, API_SEGMENTS, DISCOGS_WEB_ORIGIN, WEB_SEGMENTS } from './constants';

import type { GraphNode } from '$lib/graph/types';

export function getDiscogsProxyUrl(node: Pick<GraphNode, 'type' | 'discogsId'>): string | null {
	if (node.discogsId === null) return null;

	return `${API_BASE}/${API_SEGMENTS[node.type]}/${node.discogsId}`;
}

export function getDiscogsWebsiteUrl(
	node: Pick<GraphNode, 'type' | 'discogsId' | 'uri'>
): string | null {
	if (node.discogsId === null) return null;

	const path = node.uri ?? `/${WEB_SEGMENTS[node.type]}/${node.discogsId}`;

	if (path.startsWith(DISCOGS_WEB_ORIGIN)) return path;

	return `${DISCOGS_WEB_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
