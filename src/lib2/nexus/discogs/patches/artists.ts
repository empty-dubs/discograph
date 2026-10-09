import { discogsPlugin as discogs } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type { Artist, EntityType, Master, RelationshipType, Release } from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';	
	const linkType: RelationshipType = 'member_of';
	const sourceNodeId = String(artist.id);

	for (const member of artist.members ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, member.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, member.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	for (const group of artist.groups ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, group.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, group.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildAliasesFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'alias_of';
	const sourceNodeId = String(artist.id);

	for (const alias of artist.aliases ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, alias.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, alias.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildArtistsFromMaster(master: Master): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'released';
	const sourceNodeId = String(master.id);

	for (const artist of master.artists ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, artist.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, artist.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'released';
	const sourceNodeId = String(release.id);

	for (const artist of release.artists ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, artist.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, artist.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildCreditedArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'artist';
	const linkType: RelationshipType = 'credited_on';
	const sourceNodeId = String(release.id);

	for (const artist of release.credits ?? []) {
		if (artist.id === undefined) continue;

		const targetNodeId = discogs.compositions.nodeId(nodeType, artist.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, artist.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType, artist.role?.toLowerCase()));
	}

	for (const artist of release.extraartists ?? []) {
		if (artist.id === undefined) continue;

		const targetNodeId = discogs.compositions.nodeId(nodeType, artist.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, artist.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType, artist.role?.toLowerCase()));
	}

	return { nodes, links };
}
