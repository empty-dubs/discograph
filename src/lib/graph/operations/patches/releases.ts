import { getNodeId } from './compositions';
import { createMasterNode, createReleaseNode } from './nodes';
import { createEdge } from './edges';

import type { ArtistRelease, LabelRelease, Master, MasterVersion, Release } from '$lib/discogs/types';
import type { EdgeType, GraphLink, GraphNode, GraphPatch } from '$lib/graph/types';

function labelReleaseKind(item: LabelRelease): 'master' | 'release' {
	if (item.type) return item.type;

	return item.resource_url?.includes('/masters/') ? 'master' : 'release';
}

function firstArtistName(artists?: { name: string }[]): string | undefined {
	return artists?.[0]?.name.trim() || undefined;
}

function listingMeta(year?: number | string, artistName?: string | null): GraphNode['meta'] {
	const trimmed = artistName?.trim();

	return {
		year,
		...(trimmed ? { artistName: trimmed } : {})
	};
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
	const parentArtistName = artist.displayName ?? artist.name;

	for (const item of filtered) {
		let targetNodeId: string | null = null;
		const meta = listingMeta(item.year, item.artist ?? parentArtistName);

		if (item.type === 'master') {
			const master = createMasterNode(item, meta);

			nodes.push(master);

			targetNodeId = master.id;
		} else {
			const release = createReleaseNode(item, meta);

			targetNodeId = release.id;

			nodes.push(release);
		}

		const role = item.role?.toLowerCase();

		links.push(createEdge(sourceNodeId, targetNodeId, edgeType, role && role !== 'main' ? role : undefined));
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
		const meta = listingMeta(item.year, item.artist);

		let targetNodeId: string | null = null;

		if (releaseType === 'master') {
			const master = createMasterNode(item, meta);

			nodes.push(master);

			targetNodeId = master.id;
		} else {
			const release = createReleaseNode(item, meta);

			nodes.push(release);

			targetNodeId = release.id;
		}

		links.push(createEdge(targetNodeId, sourceNodeId, edgeType));
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[], master: GraphNode): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const edgeType: EdgeType = 'version_of';

	const sourceNodeId = master.id;
	const versionArtistName = firstArtistName(master.artists);

	for (const version of versions) {
		const targetNodeId = getNodeId('release', version.id);

		nodes.push(createReleaseNode(version, listingMeta(version.released, versionArtistName)));
		links.push(createEdge(targetNodeId, sourceNodeId, edgeType));
	}

	return { nodes, links };
}

export function buildMainReleaseFromMaster(release: Release, master: GraphNode): GraphPatch {
	const sourceNodeId = master.id;
	const targetNodeId = getNodeId('release', release.id);
	const edgeType: EdgeType = 'version_of';

	return {
		nodes: [
			createReleaseNode(
				release,
				listingMeta(release.year ?? release.released, firstArtistName(release.artists))
			)
		],
		links: [createEdge(targetNodeId, sourceNodeId, edgeType)]
	};
}

export function buildMasterFromRelease(master: Master, release: GraphNode): GraphPatch {
	const sourceNodeId = release.id;
	const masterNode = createMasterNode(master, listingMeta(master.year, firstArtistName(master.artists)));
	const edgeType: EdgeType = 'version_of';

	const targetNodeId = masterNode.id;

	return {
		nodes: [masterNode],
		links: [createEdge(sourceNodeId, targetNodeId, edgeType)]
	};
}
