import { DISCOGS_WEB_ORIGIN } from '$lib/discogs/constants';

import type {
	Artist,
	ArtistGroup,
	ArtistMember,
	Label,
	LabelRelease,
	MasterArtist,
	MasterVersion,
	Release,
	ReleaseArtist,
	SearchResult
} from '$lib/discogs/types';

import type { EdgeType, NodeType } from '../../types';

export function nodeId(type: NodeType, id: number | string): string {
	return `${type}:${id}`;
}

export function linkId(source: string, type: EdgeType, target: string): string {
	return `${source}|${type}|${target}`;
}

export type DisplayNameSource =
	| SearchResult
	| Artist
	| Label
	| Release
	| MasterVersion
	| ReleaseArtist
	| LabelRelease
	| ArtistMember
	| ArtistGroup
	| MasterArtist;

export function getDisplayName(result: DisplayNameSource, fallbackType = 'entity'): string {
	if ('title' in result && result.title) return result.title;
	if ('name' in result && result.name) return result.name;
	if ('type' in result && typeof result.type === 'string') return `Unknown ${result.type}`;

	return `Unknown ${fallbackType}`;
}

export function getDiscogsUrl(
	entity: { uri?: string; id: number },
	segment: string
): string | undefined {
	const uri = entity.uri ?? `/${segment}/${entity.id}`;

	if (!uri) return undefined;
	if (uri.startsWith(DISCOGS_WEB_ORIGIN)) return uri;

	return `${DISCOGS_WEB_ORIGIN}${uri.startsWith('/') ? uri : `/${uri}`}`;
}
