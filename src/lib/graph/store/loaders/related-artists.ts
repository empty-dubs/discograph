import * as discogs from '$lib/discogs/client';

import {
	buildFromArtist,
	buildAliasesFromArtist,
	buildArtistsFromRelease,
	buildCreditedArtistsFromRelease,
	buildFromMaster
} from '$lib/graph/builder';

import { runLoad } from '../run-load';

import type { GraphStoreContext } from '../types';

export async function loadRelatedArtists(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'artist': {
					const artist = await discogs.getArtist(discogsId);
					ctx.updateRateLimit();
					ctx.applyPatchFromExpansion(nodeId, buildFromArtist(artist));
					ctx.markArtistDetailsFetched(nodeId);
					break;
				}
				case 'release': {
					const release = await discogs.getRelease(discogsId);
					ctx.updateRateLimit();
					ctx.applyPatchFromExpansion(nodeId, buildArtistsFromRelease(release));
					break;
				}
				case 'master': {
					const master = await discogs.getMaster(discogsId);
					ctx.updateRateLimit();
					ctx.applyPatchFromExpansion(nodeId, buildFromMaster(master));
					break;
				}
			}
		},
		'Failed to load related artists'
	);
}

export async function loadRelatedCreditedArtists(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'release': {
					const release = await discogs.getRelease(discogsId);
					ctx.updateRateLimit();
					ctx.applyPatchFromExpansion(nodeId, buildCreditedArtistsFromRelease(release));
					break;
				}
			}
		},
		'Failed to load credited artists'
	);
}

export async function loadRelatedAliases(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'artist': {
					const artist = await discogs.getArtist(discogsId);
					ctx.updateRateLimit();
					ctx.applyPatchFromExpansion(nodeId, buildAliasesFromArtist(artist));
					ctx.markArtistDetailsFetched(nodeId);
					break;
				}
			}
		},
		'Failed to load related aliases'
	);
}
