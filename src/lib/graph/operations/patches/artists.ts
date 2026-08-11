import {
	type Artist,
	type Master,
	type Release,
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../../types';

import { linkId, nodeId } from './compositions';
import { artistNode } from './nodes';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [artistNode(artist)];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'member_of';

	for (const member of artist.members ?? []) {
		const sourceNode = nodeId(nodeType, member.id);
		const targetNode = nodeId(nodeType, artist.id);

		nodes.push(artistNode(member));

		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	for (const group of artist.groups ?? []) {
		const sourceNode = nodeId(nodeType, artist.id);
		const targetNode = nodeId(nodeType, group.id);

		nodes.push(artistNode(group));
		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
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
	const artistNodeId = nodeId('artist', artist.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'alias_of';

	for (const alias of artist.aliases ?? []) {
		const sourceNode = nodeId(nodeType, alias.id);

		nodes.push(artistNode(alias));
		links.push({
			id: linkId(sourceNode, edgeType, artistNodeId),
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
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const artist of release.artists ?? []) {
		const artistId = artist.id;

		if (artistId) {
			const edgeType: EdgeType = 'released';
			const sourceNode = nodeId(nodeType, artistId);

			nodes.push(artistNode({ ...artist, id: artistId }));
			links.push({
				id: linkId(sourceNode, edgeType, releaseNodeId),
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
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const extra of release.extraartists ?? []) {
		const extraId = extra.id;

		if (extraId) {
			const edgeType: EdgeType = 'credited_on';
			const sourceNode = nodeId(nodeType, extraId);

			nodes.push(artistNode({ ...extra, id: extraId }));
			links.push({
				id: linkId(sourceNode, edgeType, releaseNodeId),
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
	const masterNodeId = nodeId('master', master.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'released';

	for (const artist of master.artists ?? []) {
		const sourceNode = nodeId(nodeType, artist.id);

		nodes.push(artistNode(artist));
		links.push({
			id: linkId(sourceNode, edgeType, masterNodeId),
			source: sourceNode,
			target: masterNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}
