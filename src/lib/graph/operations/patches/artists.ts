import {
	type Artist,
	type Master,
	type Release,
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../../types';

import { getNodeId, getLinkId } from './compositions';
import { createArtistNode } from './nodes';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [createArtistNode(artist)];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'member_of';

	for (const member of artist.members ?? []) {
		const sourceNode = getNodeId(nodeType, member.id);
		const targetNode = getNodeId(nodeType, artist.id);

		nodes.push(createArtistNode(member));

		links.push({
			id: getLinkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	for (const group of artist.groups ?? []) {
		const sourceNode = getNodeId(nodeType, artist.id);
		const targetNode = getNodeId(nodeType, group.id);

		nodes.push(createArtistNode(group));
		links.push({
			id: getLinkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType,
			label: edgeType.replace('_', ' ')
		});
	}

	return { nodes, links };
}

export function buildAliasesFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const artistNodeId = getNodeId('artist', artist.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'alias_of';

	for (const alias of artist.aliases ?? []) {
		const sourceNode = getNodeId(nodeType, alias.id);

		nodes.push(createArtistNode(alias));
		links.push({
			id: getLinkId(sourceNode, edgeType, artistNodeId),
			source: sourceNode,
			target: artistNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = getNodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const artist of release.artists ?? []) {
		const artistId = artist.id;

		if (artistId) {
			const edgeType: EdgeType = 'released';
			const sourceNode = getNodeId(nodeType, artistId);

			nodes.push(createArtistNode({ ...artist, id: artistId }));
			links.push({
				id: getLinkId(sourceNode, edgeType, releaseNodeId),
				source: sourceNode,
				target: releaseNodeId,
				type: edgeType
			});
		}
	}

	return { nodes, links };
}

export function buildCreditedArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = getNodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const extra of release.extraartists ?? []) {
		const extraId = extra.id;

		if (extraId) {
			const edgeType: EdgeType = 'credited_on';
			const sourceNode = getNodeId(nodeType, extraId);

			nodes.push(createArtistNode({ ...extra, id: extraId }));
			links.push({
				id: getLinkId(sourceNode, edgeType, releaseNodeId),
				source: sourceNode,
				target: releaseNodeId,
				type: edgeType,
				label: extra.role
			});
		}
	}

	return { nodes, links };
}

export function buildFromMaster(master: Master): GraphPatch {
    const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const masterNodeId = getNodeId('master', master.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'released';

	for (const artist of master.artists ?? []) {
		const sourceNode = getNodeId(nodeType, artist.id);

		nodes.push(createArtistNode(artist));
		links.push({
			id: getLinkId(sourceNode, edgeType, masterNodeId),
			source: sourceNode,
			target: masterNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}
