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

import type { GraphNode, NodeType } from '../../types';

import { getDisplayName, nodeId } from './compositions';

type ArtistNodePayload =
	| SearchResult
	| Artist
	| ReleaseArtist
	| ArtistMember
	| ArtistGroup
	| ArtistAlias
	| MasterArtist;

type LabelNodePayload =
	| SearchResult
	| Label
	| Sublabel
	| LabelRef
	| ReleaseCompany;

type MasterNodePayload =
	| SearchResult
	| MasterVersion
	| Master;

type ReleaseNodePayload =
	| SearchResult
	| Release
	| LabelRelease
	| MasterVersion;

export function artistNode(payload: ArtistNodePayload): GraphNode {
	const nodeType: NodeType = 'artist';

	return {
		...payload,
		id: nodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType)
	};
}

export function labelNode(payload: LabelNodePayload): GraphNode {
	const nodeType: NodeType = 'label';

	return {
		...payload,
		id: nodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType)
	};
}

export function masterNode(payload: MasterNodePayload, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'master';
	const nodeURI: string | undefined = 'uri' in payload ? payload.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in payload ? payload.resource_url : undefined;

	return {
		id: nodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
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
		meta: { year: release.year ?? release.released }
	};
}

export function releaseNode(payload: ReleaseNodePayload, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'release';
	const nodeURI: string | undefined = 'uri' in payload ? payload.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in payload ? payload.resource_url : undefined

	return {
		id: nodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		meta
	};
}
