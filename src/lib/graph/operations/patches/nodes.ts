import { getDisplayName, getNodeId } from './compositions';

import type { GraphNode, NodeType } from '../../types';

import type {
	ArtistNodePayload,
	LabelNodePayload,
	MasterNodePayload,
	ReleaseNodePayload,
} from '$lib/discogs/types';

export function artistNode(payload: ArtistNodePayload): GraphNode {
	const nodeType: NodeType = 'artist';

	return {
		...payload,
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType)
	};
}

export function labelNode(payload: LabelNodePayload): GraphNode {
	const nodeType: NodeType = 'label';

	return {
		...payload,
		id: getNodeId(nodeType, payload.id),
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
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		meta
	};
}

export function releaseNode(payload: ReleaseNodePayload, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'release';
	const nodeURI: string | undefined = 'uri' in payload ? payload.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in payload ? payload.resource_url : undefined

	return {
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		meta
	};
}
