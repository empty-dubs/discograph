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
	const sourceNodeId = artist.id;

	for (const item of filtered) {
		const targetNodeType = item.type === 'master' ? 'master' : 'release';
		const targetNodeId = source.compositions.getEntityId(targetNodeType, item.id);
		const linkId = source.compositions.getRelationshipId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, targetNodeType, item.title, item.id));

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
	const sourceNodeId = label.id;

	for (const item of filtered) {
		const releaseType = labelReleaseKind(item);
		const targetNodeType = releaseType === 'master' ? 'master' : 'release';
		const targetNodeId = source.compositions.getEntityId(targetNodeType, item.id);
		const linkId = source.compositions.getRelationshipId(targetNodeId, linkType, sourceNodeId);

		nodes.push(createNode(targetNodeId, targetNodeType, listingLabel(item), item.id));
		links.push(createLink(linkId, targetNodeId, sourceNodeId, linkType));
	}

	return dedupePatch({ nodes, links });
}

export function buildFromMasterVersions(master: GraphNode, versions: MasterVersion[]): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = master.id;
	const targetNodeType: EntityType = 'release';

	for (const version of versions) {
		const targetNodeId = source.compositions.getEntityId(targetNodeType, version.id);
		const linkId = source.compositions.getRelationshipId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, targetNodeType, version.title ?? `Release ${version.id}`, version.id));
		links.push(createLink(linkId, targetNodeId, sourceNodeId, linkType));
	}

	return dedupePatch({ nodes, links });
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const targetNodeType: EntityType = 'release';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId =  master.id;
	const targetNodeId = source.compositions.getEntityId(targetNodeType, release.id);
	const linkId = source.compositions.getRelationshipId(targetNodeId, linkType, sourceNodeId);

	return {
		nodes: [createNode(targetNodeId, targetNodeType, release.title ?? `Release ${release.id}`, release.id)],
		links: [createLink(linkId, targetNodeId, sourceNodeId, linkType)]
	};
}

export function buildMasterFromRelease(master: Master, release: GraphNode): GraphPatch {
	const targetNodeType: EntityType = 'master';
	const linkType: RelationshipType = 'version_of';
	const sourceNodeId = release.id;
	const targetNodeId = source.compositions.getEntityId(targetNodeType, master.id);
	const linkId = source.compositions.getRelationshipId(sourceNodeId, linkType, targetNodeId);

	return {
		nodes: [createNode(targetNodeId, targetNodeType, master.title ?? `Master ${master.id}`, master.id)],
		links: [createLink(linkId, sourceNodeId, targetNodeId, linkType)]
	};
}
