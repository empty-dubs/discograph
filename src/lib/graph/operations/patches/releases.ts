import {
	type ArtistRelease,
	type LabelRelease,
	type MasterVersion,
	type Release,
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../../types';

import { linkId, nodeId } from './compositions';
import { masterNode, releaseNode } from './nodes';

function labelReleaseKind(item: LabelRelease): 'master' | 'release' {
	if (item.type) return item.type;

	return item.resource_url?.includes('/masters/') ? 'master' : 'release';
}

export function buildFromArtistReleases(
	releases: ArtistRelease[],
	artistId: number,
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind ? releases.filter((item) => item.type === kind) : releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const artistNodeId = nodeId('artist', artistId);
	const edgeType: EdgeType = 'released';

	for (const item of filtered) {
		const targetNodeType: NodeType = item.type;
		const targetNode = nodeId(targetNodeType, item.id);

		if (item.type === 'master') {
			nodes.push(masterNode(item, { year: item.year }));
		} else {
			nodes.push(releaseNode(item, { year: item.year }));
		}

		links.push({
			id: linkId(artistNodeId, edgeType, targetNode),
			source: artistNodeId,
			target: targetNode,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildFromLabelReleases(
	releases: LabelRelease[],
	labelId: number,
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind
		? releases.filter((item) => labelReleaseKind(item) === kind)
		: releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const labelNodeId = nodeId('label', labelId);
	const edgeType: EdgeType = 'on_label';

	for (const item of filtered) {
		const itemKind = labelReleaseKind(item);
		const targetNodeType: NodeType = itemKind;
		const sourceNode = nodeId(targetNodeType, item.id);

		if (itemKind === 'master') {
			nodes.push(masterNode(item, { year: item.year }));
		} else {
			nodes.push(releaseNode(item, { year: item.year }));
		}

		links.push({
			id: linkId(sourceNode, edgeType, labelNodeId),
			source: sourceNode,
			target: labelNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[], masterId: number): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const masterNodeId = nodeId('master', masterId);
	const edgeType: EdgeType = 'version_of';
	const releaseNodeType: NodeType = 'release';

	for (const version of versions) {
		const sourceNode = nodeId(releaseNodeType, version.id);

		nodes.push(releaseNode(version, { year: version.released }));
		links.push({
			id: linkId(sourceNode, edgeType, masterNodeId),
			source: sourceNode,
			target: masterNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, masterId: number): GraphPatch {
	const masterNodeId = nodeId('master', masterId);
	const releaseNodeId = nodeId('release', release.id);
	const edgeType: EdgeType = 'version_of';

	return {
		nodes: [releaseNode(release, { year: release.year ?? release.released })],
		links: [
			{
				id: linkId(releaseNodeId, edgeType, masterNodeId),
				source: releaseNodeId,
				target: masterNodeId,
				type: edgeType
			}
		]
	};
}
