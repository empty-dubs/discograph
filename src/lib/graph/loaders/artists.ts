import { getArtist, getMaster, getRelease } from '$lib/discogs/client';

import {
	buildFromArtist,
	buildAliasesFromArtist,
	buildArtistsFromRelease,
	buildCreditedArtistsFromRelease,
	buildFromMaster
} from '../operations/patches/artists';

import { runLoad } from './run-load';

import type { GraphContext } from '../store/graph.svelte';

export async function loadRelatedArtists(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const artist = await getArtist(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildFromArtist(artist));
				ctx.details.markArtistDetailsFetched(nodeId);
				break;
			}
			case 'release': {
				const release = await getRelease(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildArtistsFromRelease(release));
				break;
			}
			case 'master': {
				const master = await getMaster(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildFromMaster(master));
				break;
			}
		}

		ctx.progress.markActionLoaded(nodeId, 'artists');
	}, 'Failed to load related artists');
}

export async function loadRelatedCreditedArtists(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'release': {
				const release = await getRelease(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildCreditedArtistsFromRelease(release));
				break;
			}
		}

		ctx.progress.markActionLoaded(nodeId, 'credited_artists');
	}, 'Failed to load credited artists');
}

export async function loadRelatedAliases(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const artist = await getArtist(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildAliasesFromArtist(artist));
				ctx.details.markArtistDetailsFetched(nodeId);
				break;
			}
		}

		ctx.progress.markActionLoaded(nodeId, 'aliases');
	}, 'Failed to load related aliases');
}
