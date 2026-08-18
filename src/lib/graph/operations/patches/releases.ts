import { getLinkId, getNodeId } from './compositions';
import { createMasterNode, createReleaseNode } from './nodes';

import type { ArtistRelease, LabelRelease, MasterVersion, Release } from '$lib/discogs/types';
import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '$lib/graph/types';

function labelReleaseKind(item: LabelRelease): 'master' | 'release' {
	if (item.type) return item.type;

	return item.resource_url?.includes('/masters/') ? 'master' : 'release';
}

export function buildFromArtistReleases(
	releases: ArtistRelease[],
	artist: GraphNode,
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind ? releases.filter((item) => item.type === kind) : releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const sourceNodeId = artist.id;
	const edgeType: EdgeType = 'released';

	for (const item of filtered) {
		let targetNodeId: string | number | null = null;

		if (item.type === 'master') {
			const master = createMasterNode(item, { year: item.year });

			nodes.push(master);

			targetNodeId = master.id;
		} else {
			const release = createReleaseNode(item, { year: item.year });

			targetNodeId = release.id;

			nodes.push(release);
		}

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: item.role?.toLowerCase() === 'main' ? edgeType : `(${item.role?.toLowerCase()})` as EdgeType
		});
	}

	return { nodes, links };
}

export function buildFromLabelReleases(
	releases: LabelRelease[],
	label: GraphNode,
	kind?: 'master' | 'release'
): GraphPatch {
	const filtered = kind
		? releases.filter((item) => labelReleaseKind(item) === kind)
		: releases;
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const edgeType: EdgeType = 'on_label';
	const sourceNodeId = label.id;

	for (const item of filtered) {
		const releaseType = labelReleaseKind(item);
		let targetNodeId: string | number | null = null;

		if (releaseType === 'master') {
			const master = createMasterNode(item, { year: item.year });

			nodes.push(master);

			targetNodeId = master.id;
		} else {
			const release = createReleaseNode(item, { year: item.year });

			nodes.push(release);

			targetNodeId = release.id;
		}

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[], master: GraphNode): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const edgeType: EdgeType = 'version_of';
	const sourceNodeId = master.id;

	for (const version of versions) {
		const targetNodeId = getNodeId('release', version.id);

		nodes.push(createReleaseNode(version, { year: version.released }));
		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const sourceNodeId = master.id;
	const targetNodeId = getNodeId('release', release.id);
	const edgeType: EdgeType = 'version_of';

	return {
		nodes: [createReleaseNode(release, { year: release.year ?? release.released })],
		links: [
			{
				id: getLinkId(sourceNodeId, edgeType, targetNodeId),
				source: sourceNodeId,
				target: targetNodeId,
				type: edgeType
			}
		]
	};
}
