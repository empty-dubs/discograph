import { getNodeId, getLinkId } from './compositions';
import { createArtistNode } from './nodes';

import type { Artist, Master, Release } from '$lib/discogs/types';
import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '$lib/graph/types';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'member_of';
	const sourceNodeId = artist.id;

	for (const member of artist.members ?? []) {
		const targetNodeId = getNodeId(nodeType, member.id);

		nodes.push(createArtistNode(member));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	for (const group of artist.groups ?? []) {
		const targetNodeId = getNodeId(nodeType, group.id);

		nodes.push(createArtistNode(group));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType,
		});
	}

	return { nodes, links };
}

export function buildAliasesFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'alias_of';
	const sourceNodeId = artist.id;

	for (const alias of artist.aliases ?? []) {
		const targetNodeId = getNodeId(nodeType, alias.id);

		nodes.push(createArtistNode(alias));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'released';
	const sourceNodeId = release.id;

	for (const artist of release.artists ?? []) {
		const targetNodeId = getNodeId(nodeType, artist.id);

		nodes.push(createArtistNode(artist));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildCreditedArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'credited_on';
	const sourceNodeId = release.id;

	for (const artist of release.credits ?? []) {
		const targetNodeId = getNodeId(nodeType, artist.id);

		nodes.push(createArtistNode(artist));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType,
			label: artist.role?.toLowerCase()
		});
	}

	return { nodes, links };
}

export function buildFromMaster(master: Master): GraphPatch {
    const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'released';
	const sourceNodeId = master.id;

	for (const artist of master.artists ?? []) {
		const targetNodeId = getNodeId(nodeType, artist.id);

		nodes.push(createArtistNode(artist));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}
