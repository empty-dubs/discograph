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

import type { GraphInterface } from '../store/types';

export async function loadReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				graph.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'release')
				);
				graph.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				graph.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'release')
				);
				graph.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'master': {
				const versions = await getMasterVersions(discogsId, 1);
				graph.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromMasterVersions(versions.versions, discogsId)
				);
				graph.progress.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
				break;
			}
		}
	}, 'Failed to load releases');
}

export async function loadMasterReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				graph.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'master')
				);
				graph.progress.setMasterReleasePages(
					nodeId,
					releases.pagination.page,
					releases.pagination.pages
				);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				graph.expansion.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'master')
				);
				graph.progress.setMasterReleasePages(
					nodeId,
					releases.pagination.page,
					releases.pagination.pages
				);
				break;
			}
		}
	}, 'Failed to load master releases');
}

export async function loadMainRelease(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null || type !== 'master') return;

	await runLoad(graph, nodeId, async () => {
		let mainReleaseId = graph.data.nodes.get(nodeId)?.main_release?.id;

		if (!mainReleaseId) {
			const master = await getMaster(discogsId);
			await graph.details.mergeMasterDetails(nodeId, master);
			graph.details.markMasterDetailsFetched(nodeId);
			mainReleaseId = master.main_release;
		}

		if (!mainReleaseId) {
			discogsApiStore.setError('This master has no main release');
			return;
		}

		const release = await getRelease(mainReleaseId);
		graph.expansion.applyPatchFromExpansion(nodeId, buildMainReleaseFromMaster(release, discogsId));
		graph.progress.markActionLoaded(nodeId, 'main_release');
	}, 'Failed to load main release');
}

export async function loadMoreReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	const paging = graph.progress.releasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	graph.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			graph.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'release')
			);
			graph.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'label') {
			const releases = await getLabelReleases(discogsId, nextPage);
			graph.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'release')
			);
			graph.progress.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'master') {
			const versions = await getMasterVersions(discogsId, nextPage);
			graph.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromMasterVersions(versions.versions, discogsId)
			);
			graph.progress.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
		}
	}, 'Failed to load more releases');

	graph.progress.setLoading(nodeId, false);
}

export function hasMoreReleases(graph: GraphInterface, nodeId: string): boolean {
	return graph.progress.hasMoreReleases(nodeId);
}

export async function loadMoreMasterReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null || (type !== 'artist' && type !== 'label')) return;

	const paging = graph.progress.masterReleasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	graph.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			graph.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'master')
			);
			graph.progress.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		} else {
			const releases = await getLabelReleases(discogsId, nextPage);
			graph.expansion.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'master')
			);
			graph.progress.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		}
	}, 'Failed to load more master releases');

	graph.progress.setLoading(nodeId, false);
}

export function hasMoreMasterReleases(graph: GraphInterface, nodeId: string): boolean {
	return graph.progress.hasMoreMasterReleases(nodeId);
}
