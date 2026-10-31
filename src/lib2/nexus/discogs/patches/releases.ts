import { plugin as source } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import { dedupePatch } from './dedupe';

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
	artist: GraphNode,
	releases: ArtistRelease[],
	kind: 'master' | 'release'
): GraphPatch {
	const filtered = releases.filter((item) => item.type === kind);
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'released';
	const parentNodeId = artist.id;

	for (const item of filtered) {
		const nodeType = item.type === 'master' ? 'master' : 'release';
		const nodeId = source.compositions.getEntityId(nodeType, item.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, item.title, item.id));

		const role = item.role?.toLowerCase();

		links.push(
			createLink(
				linkId,
				parentNodeId,
				nodeId,
				linkType,
				undefined,
				undefined,
				role && role !== 'main' ? role : undefined
			)
		);
	}

	return dedupePatch({ nodes, links });
}

export function buildFromLabelReleases(
	label: GraphNode,
	releases: LabelRelease[],
	kind: 'master' | 'release'
): GraphPatch {
	const filtered = releases.filter((item) => labelReleaseKind(item) === kind);
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'on_label';
	const parentNodeId = label.id;

	for (const item of filtered) {
		const releaseType = labelReleaseKind(item);
		const nodeType = releaseType === 'master' ? 'master' : 'release';
		const nodeId = source.compositions.getEntityId(nodeType, item.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, listingLabel(item), item.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId));
	}

	return dedupePatch({ nodes, links });
}

export function buildFromMasterVersions(master: GraphNode, versions: MasterVersion[]): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'version_of';
	const parentNodeId = master.id;
	const nodeType: EntityType = 'release';

	for (const version of versions) {
		const nodeId = source.compositions.getEntityId(nodeType, version.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, version.title ?? `Release ${version.id}`, version.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType));
	}

	return dedupePatch({ nodes, links });
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const nodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';
	const parentNodeId =  master.id;
	const nodeId = source.compositions.getEntityId(nodeType, release.id);
	const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

	return {
		nodes: [createNode(nodeId, nodeType, release.title ?? `Release ${release.id}`, release.id)],
		links: [createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId)]
	};
}

export function buildMasterFromRelease(master: Master, release: GraphNode): GraphPatch {
	const nodeType: EntityType = 'master';
	const linkType: RelationshipType = 'version_of';
	const parentNodeId = release.id;
	const nodeId = source.compositions.getEntityId(nodeType, master.id);
	const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

	return {
		nodes: [createNode(nodeId, nodeType, master.title ?? `Master ${master.id}`, master.id)],
		links: [createLink(linkId, parentNodeId, nodeId, linkType)]
	};
}
