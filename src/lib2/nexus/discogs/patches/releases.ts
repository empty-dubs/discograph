import { discogsPlugin as discogs } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type {
	ArtistRelease,
	EntityType,
	LabelRelease,
	Master,
	MasterVersion,
	RelationshipType,
	Release
} from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

function labelReleaseKind(item: LabelRelease): 'master' | 'release' {
	if (item.type) return item.type;

	return item.resource_url?.includes('/masters/') ? 'master' : 'release';
}

function listingLabel(item: { title?: string; name?: string; artist?: string }): string {
	return item.title || item.name || item.artist || 'Unknown release';
}

export function buildFromArtistReleases(
	releases: ArtistRelease[],
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind ? releases.filter((item) => item.type === kind) : releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'released';
	const sourceNodeId = String(releases[0].id);

	for (const item of filtered) {
		const nodeType = item.type === 'master' ? 'master' : 'release';
		const targetNodeId = discogs.compositions.nodeId(nodeType, item.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, item.title));

		const role = item.role?.toLowerCase();

		links.push(
			createLink(
				linkId,
				sourceNodeId,
				targetNodeId,
				linkType,
				role && role !== 'main' ? role : undefined
			)
		);
	}

	return { nodes, links };
}

export function buildFromLabelReleases(
	releases: LabelRelease[],
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind
		? releases.filter((item) => labelReleaseKind(item) === kind)
		: releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'on_label';
	const sourceNodeId = String(releases[0].id);

	for (const item of filtered) {
		const releaseType = labelReleaseKind(item);
		const nodeType = releaseType === 'master' ? 'master' : 'release';
		const targetNodeId = discogs.compositions.nodeId(nodeType, item.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, listingLabel(item)));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[]): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';

	const sourceNodeId = String(versions[0].id);

	for (const version of versions) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, version.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, version.title ?? `Release ${version.id}`));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const nodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = master.id;
	const targetNodeId = discogs.compositions.nodeId('release', release.id);
	const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

	return {
		nodes: [createNode(targetNodeId, nodeType, release.title ?? `Release ${release.id}`)],
		links: [createLink(linkId, sourceNodeId, targetNodeId, linkType)]
	};
}

export function buildMasterFromRelease(master: Master, release: GraphNode): GraphPatch {
	const nodeType: EntityType = 'master';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = release.id;
	const targetNodeId = discogs.compositions.nodeId('master', master.id);
	const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

	return {
		nodes: [createNode(targetNodeId, nodeType, master.title ?? `Master ${master.id}`)],
		links: [createLink(linkId, sourceNodeId, targetNodeId, linkType)]
	};
}
