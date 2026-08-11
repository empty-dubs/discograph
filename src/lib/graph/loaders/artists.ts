import { getArtist, getMaster, getRelease } from '$lib/discogs/client';

import {
	buildFromArtist,
	buildAliasesFromArtist,
	buildArtistsFromRelease,
	buildCreditedArtistsFromRelease,
	buildFromMaster
} from '../operations/patches/artists';

import { runLoad } from './run-load';

import type { GraphInterface } from '../store/graph.svelte';

export async function loadRelatedArtists(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const artist = await getArtist(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildFromArtist(artist));
				graph.details.markArtistDetailsFetched(nodeId);
				break;
			}
			case 'release': {
				const release = await getRelease(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildArtistsFromRelease(release));
				break;
			}
			case 'master': {
				const master = await getMaster(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildFromMaster(master));
				break;
			}
		}

		graph.progress.markActionLoaded(nodeId, 'artists');
	}, 'Failed to load related artists');
}

export async function loadRelatedCreditedArtists(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'release': {
				const release = await getRelease(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildCreditedArtistsFromRelease(release));
				break;
			}
		}

		graph.progress.markActionLoaded(nodeId, 'credited_artists');
	}, 'Failed to load credited artists');
}

export async function loadRelatedAliases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const artist = await getArtist(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildAliasesFromArtist(artist));
				graph.details.markArtistDetailsFetched(nodeId);
				break;
			}
		}

		graph.progress.markActionLoaded(nodeId, 'aliases');
	}, 'Failed to load related aliases');
}
