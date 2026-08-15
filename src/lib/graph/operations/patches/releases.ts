import {
	type ArtistRelease,
	type LabelRelease,
	type MasterVersion,
	type Release,
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../../types';

import { getLinkId, getNodeId } from './compositions';
import { createMasterNode, createReleaseNode } from './nodes';

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
	const artistNodeId = getNodeId('artist', artistId);
	const edgeType: EdgeType = 'released';

	for (const item of filtered) {
		const targetNodeType: NodeType = item.type;
		const targetNode = getNodeId(targetNodeType, item.id);

		if (item.type === 'master') {
			nodes.push(createMasterNode(item, { year: item.year }));
		} else {
			nodes.push(createReleaseNode(item, { year: item.year }));
		}

		links.push({
			id: getLinkId(artistNodeId, edgeType, targetNode),
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
	const labelNodeId = getNodeId('label', labelId);
	const edgeType: EdgeType = 'on_label';

	for (const item of filtered) {
		const itemKind = labelReleaseKind(item);
		const targetNodeType: NodeType = itemKind;
		const sourceNode = getNodeId(targetNodeType, item.id);

		if (itemKind === 'master') {
			nodes.push(createMasterNode(item, { year: item.year }));
		} else {
			nodes.push(createReleaseNode(item, { year: item.year }));
		}

		links.push({
			id: getLinkId(sourceNode, edgeType, labelNodeId),
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
	const masterNodeId = getNodeId('master', masterId);
	const edgeType: EdgeType = 'version_of';
	const releaseNodeType: NodeType = 'release';

	for (const version of versions) {
		const sourceNode = getNodeId(releaseNodeType, version.id);

		nodes.push(createReleaseNode(version, { year: version.released }));
		links.push({
			id: getLinkId(sourceNode, edgeType, masterNodeId),
			source: sourceNode,
			target: masterNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, masterId: number): GraphPatch {
	const masterNodeId = getNodeId('master', masterId);
	const releaseNodeId = getNodeId('release', release.id);
	const edgeType: EdgeType = 'version_of';

	return {
		nodes: [createReleaseNode(release, { year: release.year ?? release.released })],
		links: [
			{
				id: getLinkId(releaseNodeId, edgeType, masterNodeId),
				source: releaseNodeId,
				target: masterNodeId,
				type: edgeType
			}
		]
	};
}
