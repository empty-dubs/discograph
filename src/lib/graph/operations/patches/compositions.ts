import type { NodePayload } from '$lib/discogs/types';

import type { EdgeType, NodeType } from '../../types';

export function nodeId(type: NodeType, id: number | string): string {
	return `${type}:${id}`;
}

export function linkId(source: string, type: EdgeType, target: string): string {
	return `${source}|${type}|${target}`;
}

export function getDisplayName(payload: NodePayload, fallbackType = 'entity'): string {
	if ('title' in payload && payload.title) return payload.title;
	if ('name' in payload && payload.name) return payload.name;
	if ('type' in payload && typeof payload.type === 'string') return `Unknown ${payload.type}`;

	return `Unknown ${fallbackType}`;
}
