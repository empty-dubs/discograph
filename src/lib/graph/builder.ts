import { DISCOGS_WEB_ORIGIN, WEB_SEGMENTS } from '$lib/discogs/constants';

import type {
	Artist,
	ArtistGroup,
	ArtistMember,
	ArtistRelease,
	Label,
	LabelRef,
	LabelRelease,
	Master,
	MasterArtist,
	MasterVersion,
	Release,
	ReleaseArtist,
	SearchResult,
	SearchType,
	Sublabel
} from '$lib/discogs/types';

import type { NodeType, EdgeType, GraphLink, GraphPatch, GraphNode } from './types';

function nodeId(type: NodeType, id: number | string): string {
	return `${type}:${id}`;
}

function linkId(source: string, type: EdgeType, target: string): string {
	return `${source}|${type}|${target}`;
}

type DisplayNameSource =
	| SearchResult
	| Artist
	| Label
	| Release
	| MasterVersion
	| ReleaseArtist
	| LabelRelease
	| ArtistMember
	| ArtistGroup
	| MasterArtist;

type ArtistNodeSource =
	| SearchResult
	| Artist
	| (ReleaseArtist & { id: number })
	| ArtistMember
	| ArtistGroup
	| MasterArtist;

type LabelNodeSource = SearchResult | Label | Sublabel | LabelRef;

type MasterNodeSource = SearchResult | MasterVersion | Master;

type ReleaseNodeSource = SearchResult | Release | LabelRelease | MasterVersion;

function getDisplayName(result: DisplayNameSource, fallbackType = 'entity'): string {
	if ('title' in result && result.title) return result.title;
	if ('name' in result && result.name) return result.name;
	if ('type' in result && typeof result.type === 'string') return `Unknown ${result.type}`;

	return `Unknown ${fallbackType}`;
}

function getDiscogsWebsiteUrl(uri?: string): string | undefined {
	if (!uri) return undefined;
	if (uri.startsWith(DISCOGS_WEB_ORIGIN)) return uri;

	return `${DISCOGS_WEB_ORIGIN}${uri.startsWith('/') ? uri : `/${uri}`}`;
}

function getDiscogsUrl(entity: { uri?: string; id: number }, segment: string): string | undefined {
	return getDiscogsWebsiteUrl(entity.uri ?? `/${segment}/${entity.id}`);
}

function artistNode(result: ArtistNodeSource): GraphNode {
	return {
		...result,
		id: nodeId('artist', result.id),
		type: 'artist',
		discogsId: result.id,
		displayName: getDisplayName(result, 'artist'),
		discogsUrl: getDiscogsUrl(result, WEB_SEGMENTS.artist)
	};
}

function labelNode(result: LabelNodeSource): GraphNode {
	return {
		...result,
		id: nodeId('label', result.id),
		type: 'label',
		discogsId: result.id,
		displayName: getDisplayName(result, 'label'),
		discogsUrl: getDiscogsUrl(result, WEB_SEGMENTS.label)
	};
}

function masterNode(result: MasterNodeSource, meta?: GraphNode['meta']): GraphNode {
	return {
		...result,
		id: nodeId('master', result.id),
		type: 'master',
		discogsId: result.id,
		displayName: getDisplayName(result, 'master'),
		name: result.title,
		discogsUrl: getDiscogsUrl(
			{ uri: 'uri' in result ? result.uri : undefined, id: result.id },
			WEB_SEGMENTS.master
		),
		meta
	};
}

function masterStubFromRelease(release: Release): GraphNode {
	const masterId = release.master_id!;

	return {
		id: nodeId('master', masterId),
		type: 'master',
		discogsId: masterId,
		displayName: release.title ?? `Master ${masterId}`,
		name: release.title,
		resource_url: release.master_url,
		discogsUrl: getDiscogsUrl({ id: masterId }, WEB_SEGMENTS.master),
		meta: { year: release.year ?? release.released }
	};
}

function releaseNode(result: ReleaseNodeSource, meta?: GraphNode['meta']): GraphNode {
	return {
		...result,
		id: nodeId('release', result.id),
		type: 'release',
		discogsId: result.id,
		displayName: getDisplayName(result, 'release'),
		name: result.title,
		discogsUrl: getDiscogsUrl(
			{ uri: 'uri' in result ? result.uri : undefined, id: result.id },
			WEB_SEGMENTS.release
		),
		meta
	};
}

export function buildFromArtist(artist: Artist): GraphPatch {
	const nodes: GraphNode[] = [artistNode(artist)];
	const links: GraphLink[] = [];

	for (const member of artist.members ?? []) {
		nodes.push(artistNode(member));
		links.push({
			id: linkId(nodeId('artist', member.id), 'member_of', nodeId('artist', artist.id)),
			source: nodeId('artist', member.id),
			target: nodeId('artist', artist.id),
			type: 'member_of'
		});
	}

	for (const group of artist.groups ?? []) {
		nodes.push(artistNode(group));
		links.push({
			id: linkId(nodeId('artist', artist.id), 'member_of', nodeId('artist', group.id)),
			source: nodeId('artist', artist.id),
			target: nodeId('artist', group.id),
			type: 'member_of',
			label: 'member of'
		});
	}

	return { nodes, links };
}

export function buildFromArtistReleases(releases: ArtistRelease[], artistId: number): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const artistNodeId = nodeId('artist', artistId);

	for (const item of releases) {
		if (item.type === 'master') {
			nodes.push(masterNode(item, {year: item.year}));
			links.push({
				id: linkId(artistNodeId, 'released', nodeId('master', item.id)),
				source: artistNodeId,
				target: nodeId('master', item.id),
				type: 'released'
			});
		} else {
			nodes.push(releaseNode(item, {year: item.year}));
			links.push({
				id: linkId(artistNodeId, 'released', nodeId('release', item.id)),
				source: artistNodeId,
				target: nodeId('release', item.id),
				type: 'released'
			});
		}
	}

	return { nodes, links };
}

export function buildFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [
		releaseNode(release, {
			year: release.year ?? release.released,
			genres: release.genres
		})
	];
	const links: GraphLink[] = [];
	const releaseNodeId = nodeId('release', release.id);

	for (const artist of release.artists ?? []) {
		const artistId = artist.id;

		if (artistId) {
			nodes.push(artistNode({ ...artist, id: artistId }));
			links.push({
				id: linkId(nodeId('artist', artistId), 'released', releaseNodeId),
				source: nodeId('artist', artistId),
				target: releaseNodeId,
				type: 'released'
			});
		}
	}

	for (const extra of release.extraartists ?? []) {
		const extraId = extra.id;

		if (extraId) {
			nodes.push(artistNode({ ...extra, id: extraId }));
			links.push({
				id: linkId(nodeId('artist', extraId), 'credited_on', releaseNodeId),
				source: nodeId('artist', extraId),
				target: releaseNodeId,
				type: 'credited_on',
				label: extra.role
			});
		}
	}

	for (const label of release.labels ?? []) {
		nodes.push(labelNode(label));
		links.push({
			id: linkId(releaseNodeId, 'on_label', nodeId('label', label.id)),
			source: releaseNodeId,
			target: nodeId('label', label.id),
			type: 'on_label'
		});
	}

	if (release.master_id) {
		nodes.push(masterStubFromRelease(release));
		links.push({
			id: linkId(releaseNodeId, 'version_of', nodeId('master', release.master_id)),
			source: releaseNodeId,
			target: nodeId('master', release.master_id),
			type: 'version_of'
		});
	}

	for (const track of release.tracklist ?? []) {
		if (track.type_ && track.type_ !== 'track') continue;

		const trackNodeId = nodeId('track', `${release.id}:${track.position}`);

		nodes.push({
			id: trackNodeId,
			type: 'track',
			discogsId: null,
			name: track.title,
			displayName: track.title,
			meta: {
				position: track.position,
				duration: track.duration
			}
		});

		links.push({
			id: linkId(releaseNodeId, 'has_track', trackNodeId),
			source: releaseNodeId,
			target: trackNodeId,
			type: 'has_track'
		});
	}

	return { nodes, links };
}

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [labelNode(label)];
	const links: GraphLink[] = [];

	for (const sublabel of label.sublabels ?? []) {
		nodes.push(labelNode(sublabel));
		links.push({
			id: linkId(nodeId('label', sublabel.id), 'sublabel_of', nodeId('label', label.id)),
			source: nodeId('label', sublabel.id),
			target: nodeId('label', label.id),
			type: 'sublabel_of'
		});
	}

	if (label.parent_label) {
		nodes.push(labelNode(label.parent_label));
		links.push({
			id: linkId(nodeId('label', label.id), 'sublabel_of', nodeId('label', label.parent_label.id)),
			source: nodeId('label', label.id),
			target: nodeId('label', label.parent_label.id),
			type: 'sublabel_of'
		});
	}

	return { nodes, links };
}

export function buildFromLabelReleases(releases: LabelRelease[], labelId: number): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const labelNodeId = nodeId('label', labelId);

	for (const item of releases) {
		nodes.push(releaseNode(item, {year: item.year}));
		links.push({
			id: linkId(nodeId('release', item.id), 'on_label', labelNodeId),
			source: nodeId('release', item.id),
			target: labelNodeId,
			type: 'on_label'
		});
	}

	return { nodes, links };
}

export function buildFromMasterVersions(versions: MasterVersion[], masterId: number): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const masterNodeId = nodeId('master', masterId);

	for (const version of versions) {
		nodes.push(releaseNode(version, {year: version.released}));
		links.push({
			id: linkId(nodeId('release', version.id), 'version_of', masterNodeId),
			source: nodeId('release', version.id),
			target: masterNodeId,
			type: 'version_of'
		});
	}

	return { nodes, links };
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

	for (const artist of master.artists ?? []) {
		nodes.push(artistNode(artist));
		links.push({
			id: linkId(nodeId('artist', artist.id), 'released', masterNodeId),
			source: nodeId('artist', artist.id),
			target: masterNodeId,
			type: 'released'
		});
	}

	return { nodes, links };
}

type SearchResultBuilder = (result: SearchResult) => GraphNode;

const searchResultBuilders: Record<string, SearchResultBuilder> = {
	artist: (result) => artistNode(result),
	label: (result) => labelNode(result),
	master: (result) => masterNode(result,{ year: result.year }),
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
