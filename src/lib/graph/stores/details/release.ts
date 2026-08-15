import { getMaster } from '$lib/discogs/client';

import type { Release, ReleaseFormat } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode } from '$lib/graph/types';

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

export async function mergeReleaseDetails(
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
