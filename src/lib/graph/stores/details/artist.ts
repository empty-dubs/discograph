import type { Artist } from '$lib/discogs/types';

import type { DetailsTrackerContext } from '../types';

export function mergeArtistDetails(ctx: DetailsTrackerContext, nodeId: string, artist: Artist) {
	const existing = ctx.nodes.get(nodeId);

	if (!existing) return;

	const next = new Map(ctx.nodes);

	next.set(nodeId, {
		...existing,
		profile: artist.profile,
		realname: artist.realname ?? undefined,
		urls: artist.urls,
		namevariations: artist.namevariations,
		groups: artist.groups?.map(({ id, name }) => ({ id, name })),
		aliases: artist.aliases?.map(({ id, name }) => ({ id, name })),
		members: artist.members?.map(({ id, name, active }) => ({ id, name, active }))
	});

	ctx.setNodes(next);
}
