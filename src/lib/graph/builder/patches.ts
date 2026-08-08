import {
	labelReleaseKind,
	type Artist,
	type ArtistRelease,
	type Label,
	type LabelRelease,
	type Master,
	type MasterVersion,
	type Release,
	type SearchResult,
	type SearchType
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../types';

import { linkId, nodeId } from './compositions';
import { artistNode, labelNode, masterNode, releaseNode } from './nodes';

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [artistNode(artist)];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'member_of';

	for (const member of artist.members ?? []) {
		const sourceNode = nodeId(nodeType, member.id);
		const targetNode = nodeId(nodeType, artist.id);

		nodes.push(artistNode(member));

		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	for (const group of artist.groups ?? []) {
		const sourceNode = nodeId(nodeType, artist.id);
		const targetNode = nodeId(nodeType, group.id);

		nodes.push(artistNode(group));
		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType,
			label: edgeType.replace('_', ' ')
		});
	}

	return { nodes, links };
}

export function buildAliasesFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const artistNodeId = nodeId('artist', artist.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'alias_of';

	for (const alias of artist.aliases ?? []) {
		const sourceNode = nodeId(nodeType, alias.id);

		nodes.push(artistNode(alias));
		links.push({
			id: linkId(sourceNode, edgeType, artistNodeId),
			source: sourceNode,
			target: artistNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
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

export function buildArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const artist of release.artists ?? []) {
		const artistId = artist.id;

		if (artistId) {
			const edgeType: EdgeType = 'released';
			const sourceNode = nodeId(nodeType, artistId);

			nodes.push(artistNode({ ...artist, id: artistId }));
			links.push({
				id: linkId(sourceNode, edgeType, releaseNodeId),
				source: sourceNode,
				target: releaseNodeId,
				type: edgeType
			});
		}
	}

	return { nodes, links };
}

export function buildCreditedArtistsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'artist';

	for (const extra of release.extraartists ?? []) {
		const extraId = extra.id;

		if (extraId) {
			const edgeType: EdgeType = 'credited_on';
			const sourceNode = nodeId(nodeType, extraId);

			nodes.push(artistNode({ ...extra, id: extraId }));
			links.push({
				id: linkId(sourceNode, edgeType, releaseNodeId),
				source: sourceNode,
				target: releaseNodeId,
				type: edgeType,
				label: extra.role
			});
		}
	}

	return { nodes, links };
}

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'label';

	for (const label of release.labels ?? []) {
		const edgeType: EdgeType = 'on_label';
		const targetNode = nodeId(nodeType, label.id);

		nodes.push(labelNode(label));
		links.push({
			id: linkId(releaseNodeId, edgeType, targetNode),
			source: releaseNodeId,
			target: targetNode,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = nodeId('release', release.id);
	const nodeType: NodeType = 'label';

	for (const company of release.companies ?? []) {
		const edgeType: EdgeType = 'company_on';
		const targetNode = nodeId(nodeType, company.id);

		nodes.push(labelNode(company));
		links.push({
			id: linkId(releaseNodeId, edgeType, targetNode),
			source: releaseNodeId,
			target: targetNode,
			type: edgeType,
			label: company.entity_type_name
		});
	}

	return { nodes, links };
}

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [labelNode(label)];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'label';
	const edgeType: EdgeType = 'sublabel_of';

	for (const sublabel of label.sublabels ?? []) {
		const sourceNode = nodeId(nodeType, sublabel.id);
		const targetNode = nodeId(nodeType, label.id);

		nodes.push(labelNode(sublabel));
		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	if (label.parent_label) {
		const sourceNode = nodeId(nodeType, label.id);
		const targetNode = nodeId(nodeType, label.parent_label.id);

		nodes.push(labelNode(label.parent_label));
		links.push({
			id: linkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
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

export function buildFromMaster(master: Master): GraphPatch {
	const nodes: GraphNode[] = [
		masterNode(master, {
			year: master.year,
			genres: master.genres
		})
	];
	const links: GraphLink[] = [];
	const masterNodeId = nodeId('master', master.id);
	const nodeType: NodeType = 'artist';
	const edgeType: EdgeType = 'released';

	for (const artist of master.artists ?? []) {
		const sourceNode = nodeId(nodeType, artist.id);

		nodes.push(artistNode(artist));
		links.push({
			id: linkId(sourceNode, edgeType, masterNodeId),
			source: sourceNode,
			target: masterNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

type SearchResultBuilder = (result: SearchResult) => GraphNode;

const searchResultBuilders: Record<string, SearchResultBuilder> = {
	artist: (result) => artistNode(result),
	label: (result) => labelNode(result),
	master: (result) => masterNode(result, { year: result.year }),
	release: (result) => releaseNode(result, { year: result.year })
};

export function buildFromSearchResult(result: SearchResult): GraphPatch {
	try {
		const buildNode = searchResultBuilders[result.type as SearchType];
		return { nodes: [buildNode(result)], links: [] };
	} catch (error) {
		console.error(error);
		return { nodes: [], links: [] };
	}
}
