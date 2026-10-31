import { plugin as source } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type { Artist, EntityType, Master, RelationshipType, Release } from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'member_of';
	const parentNodeId = source.compositions.getEntityId(nodeType, artist.id);

	for (const member of artist.members ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, member.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, member.name, member.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId));
	}

	for (const group of artist.groups ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, group.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, group.name, group.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType));
	}

	return { nodes, links };
}

export function buildAliasesFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'alias_of';
		const parentNodeId = source.compositions.getEntityId(nodeType, artist.id);

	for (const alias of artist.aliases ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, alias.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, alias.name, alias.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType));
	}

	return { nodes, links };
}

export function buildArtistsFromMaster(master: Master): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const parentNodeType: EntityType = 'master';
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'released';
	const parentNodeId = source.compositions.getEntityId(parentNodeType, master.id);

	for (const artist of master.artists ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, artist.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, artist.name, artist.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId));
	}

	return { nodes, links };
}

export function buildArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const parentNodeType: EntityType = 'release';
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'released';
	const parentNodeId = source.compositions.getEntityId(parentNodeType, release.id);

	for (const artist of release.artists ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, artist.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, artist.name, artist.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId));
	}

	return { nodes, links };
}

export function buildCreditedArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const parentNodeType: EntityType = 'release';
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'credited_on';
	const parentNodeId = source.compositions.getEntityId(parentNodeType, release.id);

	for (const artist of release.credits ?? []) {
		if (artist.id === undefined) continue;

		const nodeId = source.compositions.getEntityId(nodeType, artist.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, artist.name, artist.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId, artist.role?.toLowerCase()));
	}

	for (const artist of release.extraartists ?? []) {
		if (artist.id === undefined) continue;

		const nodeId = source.compositions.getEntityId(nodeType, artist.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, artist.name, artist.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId, artist.role?.toLowerCase()));
	}

	for (const track of release.tracklist ?? []) {
		for (const artist of track.extraartists ?? []) {
			if (artist.id === undefined) continue;

			const nodeId = source.compositions.getEntityId(nodeType, artist.id);
			const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

			nodes.push(createNode(nodeId, nodeType, artist.name, artist.id));
			links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId, 'track appearance'));
		}
	}

	return { nodes, links };
}
