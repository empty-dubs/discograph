import * as discogs from '$lib/discogs/client';
import { discogsApiStore } from '$lib/discogs/api.svelte';

import {
	buildFromArtistReleases,
	buildFromLabelReleases,
	buildFromMasterVersions,
	buildMainReleaseFromMaster
} from '$lib/graph/builder';

import { runLoad } from '../run-load';

import type { GraphStoreContext } from '../types';

export async function loadReleases(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'artist': {
					const releases = await discogs.getArtistReleases(discogsId, 1);
					ctx.applyPatchFromExpansion(
						nodeId,
						buildFromArtistReleases(releases.releases, discogsId, 'release')
					);
					ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});
					break;
				}
				case 'label': {
					const releases = await discogs.getLabelReleases(discogsId, 1);
					ctx.applyPatchFromExpansion(
						nodeId,
						buildFromLabelReleases(releases.releases, discogsId, 'release')
					);
					ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});
					break;
				}
				case 'master': {
					const versions = await discogs.getMasterVersions(discogsId, 1);
					ctx.applyPatchFromExpansion(nodeId, buildFromMasterVersions(versions.versions, discogsId));
					ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
						page: versions.pagination.page,
						pages: versions.pagination.pages
					});
					break;
				}
			}
		},
		'Failed to load releases'
	);
}

export async function loadMasterReleases(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'artist': {
					const releases = await discogs.getArtistReleases(discogsId, 1);
					ctx.applyPatchFromExpansion(
						nodeId,
						buildFromArtistReleases(releases.releases, discogsId, 'master')
					);
					ctx.masterReleasePages = new Map(ctx.masterReleasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});
					break;
				}
				case 'label': {
					const releases = await discogs.getLabelReleases(discogsId, 1);
					ctx.applyPatchFromExpansion(
						nodeId,
						buildFromLabelReleases(releases.releases, discogsId, 'master')
					);
					ctx.masterReleasePages = new Map(ctx.masterReleasePages).set(nodeId, {
						page: releases.pagination.page,
						pages: releases.pagination.pages
					});
					break;
				}
			}
		},
		'Failed to load master releases'
	);
}

export async function loadMainRelease(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null || type !== 'master') return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			let mainReleaseId = ctx.nodes.get(nodeId)?.main_release?.id;

			if (!mainReleaseId) {
				const master = await discogs.getMaster(discogsId);
				await ctx.mergeMasterDetails(nodeId, master);
				ctx.markMasterDetailsFetched(nodeId);
				mainReleaseId = master.main_release;
			}

			if (!mainReleaseId) {
				discogsApiStore.setError('This master has no main release');
				return;
			}

			const release = await discogs.getRelease(mainReleaseId);
			ctx.applyPatchFromExpansion(nodeId, buildMainReleaseFromMaster(release, discogsId));
		},
		'Failed to load main release'
	);
}

export async function loadMoreReleases(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	const paging = ctx.releasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	ctx.setLoading(nodeId, true);
	discogsApiStore.clearError();

	try {
		if (type === 'artist') {
			const releases = await discogs.getArtistReleases(discogsId, nextPage);
			ctx.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'release')
			);
			ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
				page: releases.pagination.page,
				pages: releases.pagination.pages
			});
		} else if (type === 'label') {
			const releases = await discogs.getLabelReleases(discogsId, nextPage);
			ctx.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'release')
			);
			ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
				page: releases.pagination.page,
				pages: releases.pagination.pages
			});
		} else if (type === 'master') {
			const versions = await discogs.getMasterVersions(discogsId, nextPage);
			ctx.applyPatchFromExpansion(nodeId, buildFromMasterVersions(versions.versions, discogsId));
			ctx.releasePages = new Map(ctx.releasePages).set(nodeId, {
				page: versions.pagination.page,
				pages: versions.pagination.pages
			});
		}
	} catch (err) {
		discogsApiStore.setError(err instanceof Error ? err.message : 'Failed to load more releases');
	} finally {
		ctx.setLoading(nodeId, false);
	}
}

export function hasMoreReleases(ctx: GraphStoreContext, nodeId: string): boolean {
	const paging = ctx.releasePages.get(nodeId);

	return paging ? paging.page < paging.pages : false;
}

export async function loadMoreMasterReleases(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null || (type !== 'artist' && type !== 'label')) return;

	const paging = ctx.masterReleasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	ctx.setLoading(nodeId, true);
	discogsApiStore.clearError();

	try {
		if (type === 'artist') {
			const releases = await discogs.getArtistReleases(discogsId, nextPage);
			ctx.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'master')
			);
			ctx.masterReleasePages = new Map(ctx.masterReleasePages).set(nodeId, {
				page: releases.pagination.page,
				pages: releases.pagination.pages
			});
		} else {
			const releases = await discogs.getLabelReleases(discogsId, nextPage);
			ctx.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'master')
			);
			ctx.masterReleasePages = new Map(ctx.masterReleasePages).set(nodeId, {
				page: releases.pagination.page,
				pages: releases.pagination.pages
			});
		}
	} catch (err) {
		discogsApiStore.setError(err instanceof Error ? err.message : 'Failed to load more master releases');
	} finally {
		ctx.setLoading(nodeId, false);
	}
}

export function hasMoreMasterReleases(ctx: GraphStoreContext, nodeId: string): boolean {
	const paging = ctx.masterReleasePages.get(nodeId);

	return paging ? paging.page < paging.pages : false;
}
