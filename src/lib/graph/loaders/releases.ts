import {
	getArtistReleases,
	getLabelReleases,
	getMaster,
	getMasterVersions,
	getRelease
} from '$lib/discogs/client';
import { discogsApiStore } from '$lib/discogs/api-store.svelte';

import {
	buildFromArtistReleases,
	buildFromLabelReleases,
	buildFromMasterVersions,
	buildMainReleaseFromMaster
} from '../operations/patches/releases';

import { runLoad } from './run-load';

import type { GraphContext } from '../store/graph.svelte';

export async function loadReleases(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				ctx.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'release')
				);
				ctx.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				ctx.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'release')
				);
				ctx.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'master': {
				const versions = await getMasterVersions(discogsId, 1);
				ctx.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromMasterVersions(versions.versions, discogsId)
				);
				ctx.progress.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
				break;
			}
		}
	}, 'Failed to load releases');
}

export async function loadMasterReleases(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				ctx.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'master')
				);
				ctx.progress.setMasterReleasePages(
					nodeId,
					releases.pagination.page,
					releases.pagination.pages
				);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				ctx.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'master')
				);
				ctx.progress.setMasterReleasePages(
					nodeId,
					releases.pagination.page,
					releases.pagination.pages
				);
				break;
			}
		}
	}, 'Failed to load master releases');
}

export async function loadMainRelease(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null || type !== 'master') return;

	await runLoad(ctx, nodeId, async () => {
		let mainReleaseId = ctx.data.nodes.get(nodeId)?.main_release?.id;

		if (!mainReleaseId) {
			const master = await getMaster(discogsId);
			await ctx.details.mergeMasterDetails(nodeId, master);
			ctx.details.markMasterDetailsFetched(nodeId);
			mainReleaseId = master.main_release;
		}

		if (!mainReleaseId) {
			discogsApiStore.setError('This master has no main release');
			return;
		}

		const release = await getRelease(mainReleaseId);
		ctx.expansion.applyPatchFromExpansion(nodeId, buildMainReleaseFromMaster(release, discogsId));
		ctx.progress.markActionLoaded(nodeId, 'main_release');
	}, 'Failed to load main release');
}

export async function loadMoreReleases(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	const paging = ctx.progress.releasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	ctx.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			ctx.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'release')
			);
			ctx.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'label') {
			const releases = await getLabelReleases(discogsId, nextPage);
			ctx.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'release')
			);
			ctx.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'master') {
			const versions = await getMasterVersions(discogsId, nextPage);
			ctx.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromMasterVersions(versions.versions, discogsId)
			);
			ctx.progress.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
		}
	}, 'Failed to load more releases');

	ctx.progress.setLoading(nodeId, false);
}

export function hasMoreReleases(ctx: GraphContext, nodeId: string): boolean {
	return ctx.progress.hasMoreReleases(nodeId);
}

export async function loadMoreMasterReleases(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null || (type !== 'artist' && type !== 'label')) return;

	const paging = ctx.progress.masterReleasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	ctx.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			ctx.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'master')
			);
			ctx.progress.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		} else {
			const releases = await getLabelReleases(discogsId, nextPage);
			ctx.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'master')
			);
			ctx.progress.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		}
	}, 'Failed to load more master releases');

	ctx.progress.setLoading(nodeId, false);
}

export function hasMoreMasterReleases(ctx: GraphContext, nodeId: string): boolean {
	return ctx.progress.hasMoreMasterReleases(nodeId);
}
