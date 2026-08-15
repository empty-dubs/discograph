import { getDisplayName, getNodeId } from './compositions';

import type { GraphNode, NodeType } from '../../types';

import type { GraphInterface } from '$lib/graph/graph';

import type {
	Artist,
	ArtistNodePayload,
	Label,
	LabelNodePayload,
	Master,
	MasterNodePayload,
	ReleaseNodePayload,
	ReleaseFormat,
	Release,
} from '$lib/discogs/types';
import { getRelease, getMaster } from '$lib/discogs/client';

export function createArtistNode(payload: ArtistNodePayload): GraphNode {
	const nodeType: NodeType = 'artist';

	return {
		...payload,
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType)
	};
}

export function createLabelNode(payload: LabelNodePayload): GraphNode {
	const nodeType: NodeType = 'label';

	return {
		...payload,
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType)
	};
}

export function createMasterNode(payload: MasterNodePayload, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'master';
	const nodeURI: string | undefined = 'uri' in payload ? payload.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in payload ? payload.resource_url : undefined;

	return {
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		meta
	};
}

export function createReleaseNode(payload: ReleaseNodePayload, meta?: GraphNode['meta']): GraphNode {
	const nodeType: NodeType = 'release';
	const nodeURI: string | undefined = 'uri' in payload ? payload.uri : undefined;
	const nodeResourceURL: string | undefined = 'resource_url' in payload ? payload.resource_url : undefined

	return {
		id: getNodeId(nodeType, payload.id),
		type: nodeType,
		discogsId: payload.id,
		displayName: getDisplayName(payload, nodeType),
		name: payload.title,
		uri: nodeURI,
		resource_url: nodeResourceURL,
		meta
	};
}

export function updateArtistNode(node: GraphNode, graph: GraphInterface, artist: Artist) {
	if (!node) return;

	const next = new Map(graph.data.nodes);

	next.set(node.id, {
		...node,
		profile: artist.profile,
		realname: artist.realname ?? undefined,
		urls: artist.urls ?? [],
		namevariations: artist.namevariations ?? [],
		groups: artist.groups?.map(({ id, name }) => ({ id, name })),
		aliases: artist.aliases?.map(({ id, name }) => ({ id, name })),
		members: artist.members?.map(({ id, name, active }) => ({ id, name, active }))
	});

	graph.data.nodes = next;
}

export function updateLabelNode(node: GraphNode, graph: GraphInterface, label: Label) {
	if (!node) return;

	const next = new Map(graph.data.nodes);

	next.set(node.id, {
		...node,
		profile: label.profile,
		urls: label.urls ?? [],
		parent_label: label.parent_label ?? undefined,
		sublabels: label.sublabels?.map(({ id, name }) => ({ id, name })) ?? []
	});

	graph.data.nodes = next;
}

async function resolveMainReleaseTitle(
	graph: GraphInterface,
	id: number
): Promise<string> {
	const releaseNodeId = `release:${id}`;
	const existing = graph.data.nodes.get(releaseNodeId);

	if (existing) return existing.displayName;

	try {
		const release = await getRelease(id);
		return release.title;
	} catch {
		return `Release ${id}`;
	}
}

export async function updateMasterNode(
	node: GraphNode,
	graph: GraphInterface,
	master: Master
) {
	if (!node) return;

	const mainRelease = master.main_release
		? {
				id: master.main_release,
				title: await resolveMainReleaseTitle(graph, master.main_release)
			}
		: undefined;

	const next = new Map(graph.data.nodes);

	next.set(node.id, {
		...node,
		artists: master.artists?.map(({ id, name }) => ({ id, name })),
		tracklist: master.tracklist?.map(({ position, title, duration }) => ({
			position,
			title,
			duration
		})),
		main_release: mainRelease,
		meta: {
			...node.meta,
			year: master.year ?? node.meta?.year,
			genres: master.genres ?? node.meta?.genres,
			styles: master.styles
		}
	});

	graph.data.nodes = next;
}

function formatReleaseFormats(formats: ReleaseFormat[]): string {
	return formats
		.map((format) => [format.name, ...(format.descriptions ?? [])].filter(Boolean).join(', '))
		.join(' / ');
}

async function resolveMasterTitle(graph: GraphInterface, id: number): Promise<string> {
	const masterNodeId = `master:${id}`;
	const existing = graph.data.nodes.get(masterNodeId);

	if (existing) return existing.displayName;

	try {
		const master = await getMaster(id);
		return master.title;
	} catch {
		return `Master ${id}`;
	}
}

export async function updateReleaseNode(
	node: GraphNode,
	graph: GraphInterface,
	release: Release
) {
	if (!node) return;

	const linkedMaster = release.master_id
		? {
				id: release.master_id,
				title: await resolveMasterTitle(graph, release.master_id)
			}
		: undefined;

	const next = new Map(graph.data.nodes);

	next.set(node.id, {
		...node,
		artists: (release.artists ?? [])
			.filter((artist): artist is typeof artist & { id: number } => artist.id !== undefined)
			.map(({ id, name }) => ({ id, name })),
		labels: release.labels?.map(({ id, name, catno }) => ({ id, name, catno })),
		credits: (release.extraartists ?? [])
			.filter((artist): artist is typeof artist & { id: number } => artist.id !== undefined)
			.map(({ id, name, role }) => ({ id, name, role })),
		companies: release.companies?.map(({ id, name, entity_type_name }) => ({
			id,
			name,
			entity_type_name
		})),
		tracklist: release.tracklist?.map(({ position, title, duration }) => ({
			position,
			title,
			duration
		})),
		notes: release.notes,
		linked_master: linkedMaster,
		meta: {
			...node.meta,
			year: release.year ?? node.meta?.year,
			genres: release.genres ?? node.meta?.genres,
			styles: release.styles,
			released: release.released_formatted ?? release.released,
			country: release.country,
			format: release.formats?.length ? formatReleaseFormats(release.formats) : undefined
		}
	});

	graph.data.nodes = next;
}
