import * as discogs from '$lib/discogs/client';

import type { Master } from '$lib/discogs/types';

import type { DetailsTrackerContext } from '../types';

async function resolveMainReleaseTitle(
	ctx: DetailsTrackerContext,
	id: number
): Promise<string> {
	const releaseNodeId = `release:${id}`;
	const existing = ctx.nodes.get(releaseNodeId);

	if (existing) return existing.displayName;

	try {
		const release = await discogs.getRelease(id);
		return release.title;
	} catch {
		return `Release ${id}`;
	}
}

export async function mergeMasterDetails(
	ctx: DetailsTrackerContext,
	nodeId: string,
	master: Master
) {
	const existing = ctx.nodes.get(nodeId);

	if (!existing) return;

	const mainRelease = master.main_release
		? {
				id: master.main_release,
				title: await resolveMainReleaseTitle(ctx, master.main_release)
			}
		: undefined;

	const next = new Map(ctx.nodes);

	next.set(nodeId, {
		...existing,
		artists: master.artists?.map(({ id, name }) => ({ id, name })),
		tracklist: master.tracklist?.map(({ position, title, duration }) => ({
			position,
			title,
			duration
		})),
		main_release: mainRelease,
		meta: {
			...existing.meta,
			year: master.year ?? existing.meta?.year,
			genres: master.genres ?? existing.meta?.genres,
			styles: master.styles
		}
	});

	ctx.setNodes(next);
}
