import { getRelease } from '$lib/discogs/client';

import type { Master } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode } from '$lib/graph/types';

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

export async function mergeMasterDetails(
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
