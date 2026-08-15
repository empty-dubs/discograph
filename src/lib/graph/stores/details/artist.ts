import type { Artist } from '$lib/discogs/types';
import type { GraphNode } from '$lib/graph/types';
import type { GraphInterface } from '$lib/graph/graph';

export function mergeArtistDetails(node: GraphNode, graph: GraphInterface, artist: Artist) {
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