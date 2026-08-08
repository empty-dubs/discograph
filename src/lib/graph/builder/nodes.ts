import type {
	Artist,
	ArtistAlias,
	ArtistGroup,
	ArtistMember,
	Label,
	LabelRef,
	LabelRelease,
	Master,
	MasterArtist,
	MasterVersion,
	Release,
	ReleaseArtist,
	ReleaseCompany,
	SearchResult,
	Sublabel
} from '$lib/discogs/types';

import type { GraphNode, NodeType } from '../types';

import { getDisplayName, getDiscogsUrl, nodeId } from './compositions';

export type ArtistNodeSource =
	| SearchResult
	| Artist
	| (ReleaseArtist & { id: number })
	| ArtistMember
	| ArtistGroup
	| ArtistAlias
	| MasterArtist;

export type LabelNodeSource = SearchResult | Label | Sublabel | LabelRef | ReleaseCompany;

export type MasterNodeSource = SearchResult | MasterVersion | Master;

export type ReleaseNodeSource = SearchResult | Release | LabelRelease | MasterVersion;

export function artistNode(result: ArtistNodeSource): GraphNode {
	const nodeType: NodeType = 'artist';

	return {
		...result,
		id: nodeId(nodeType, result.id),
		type: nodeType,
		discogsId: result.id,
		displayName: getDisplayName(result, nodeType),
		discogsUrl: getDiscogsUrl(result, nodeType)
	};
}

export function labelNode(result: LabelNodeSource): GraphNode {
	const nodeType: NodeType = 'label';

	return {
		...result,
		id: nodeId(nodeType, result.id),
		type: nodeType,
		discogsId: result.id,
		displayName: getDisplayName(result, nodeType),
		discogsUrl: getDiscogsUrl(result, nodeType)
	};
}

export function masterNode(result: MasterNodeSource, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'master';
	const nodeURI: string | undefined = 'uri' in result ? result.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in result ? result.resource_url : undefined;

	return {
		id: nodeId(nodeType, result.id),
		type: nodeType,
		discogsId: result.id,
		displayName: getDisplayName(result, nodeType),
		name: result.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		discogsUrl: getDiscogsUrl(
			{ uri: nodeURI, id: result.id },
			nodeType
		),
		meta
	};
}

export function masterStubFromRelease(release: Release): GraphNode {
	const masterId = release.master_id!;
	const nodeType: NodeType = 'master';

	return {
		id: nodeId(nodeType, masterId),
		type: nodeType,
		discogsId: masterId,
		displayName: release.title ?? `Master ${masterId}`,
		name: release.title,
		resource_url: release.master_url,
		discogsUrl: getDiscogsUrl({ id: masterId }, nodeType),
		meta: { year: release.year ?? release.released }
	};
}

export function releaseNode(result: ReleaseNodeSource, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'release';
	const nodeURI: string | undefined = 'uri' in result ? result.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in result ? result.resource_url : undefined

	return {
		id: nodeId(nodeType, result.id),
		type: nodeType,
		discogsId: result.id,
		displayName: getDisplayName(result, nodeType),
		name: result.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		discogsUrl: getDiscogsUrl(
			{ uri: nodeURI, id: result.id },
			nodeType
		),
		meta
	};
}
