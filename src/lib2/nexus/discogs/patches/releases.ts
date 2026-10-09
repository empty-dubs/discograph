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
	kind: 'master' | 'release'
): GraphPatch {
	const filtered = releases.filter((item) => item.type === kind);
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'released';
	const sourceNodeId = discogs.compositions.nodeId(kind, releases[0].id);

	for (const item of filtered) {
		const nodeType = item.type === 'master' ? 'master' : 'release';
		const targetNodeId = discogs.compositions.nodeId(nodeType, item.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, item.title, item.id));

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
	kind: 'master' | 'release'
): GraphPatch {
	const filtered = releases.filter((item) => labelReleaseKind(item) === kind);
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'on_label';
	const sourceNodeId = discogs.compositions.nodeId(kind, releases[0].id);

	for (const item of filtered) {
		const releaseType = labelReleaseKind(item);
		const nodeType = releaseType === 'master' ? 'master' : 'release';
		const targetNodeId = discogs.compositions.nodeId(nodeType, item.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, listingLabel(item), item.id));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[]): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = discogs.compositions.nodeId(nodeType, versions[0].id);

	for (const version of versions) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, version.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, version.title ?? `Release ${version.id}`, version.id));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const sourceNodeType: EntityType = 'master';
	const targetNodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = discogs.compositions.nodeId(sourceNodeType, master.id);
	const targetNodeId = discogs.compositions.nodeId(targetNodeType, release.id);
	const linkId = discogs.compositions.linkId(targetNodeId, linkType, sourceNodeId);

	return {
		nodes: [createNode(targetNodeId, targetNodeType, release.title ?? `Release ${release.id}`, release.id)],
		links: [createLink(linkId, sourceNodeId, targetNodeId, linkType)]
	};
}

export function buildMasterFromRelease(master: Master, release: GraphNode): GraphPatch {
	const sourceNodeType: EntityType = 'release';
	const targetNodeType: EntityType = 'master';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = discogs.compositions.nodeId(sourceNodeType, release.id);
	const targetNodeId = discogs.compositions.nodeId(targetNodeType, master.id);
	const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

	return {
		nodes: [createNode(targetNodeId, targetNodeType, master.title ?? `Master ${master.id}`, master.id)],
		links: [createLink(linkId, sourceNodeId, targetNodeId, linkType)]
	};
}
