import {
	getArtistReleases,
	getLabelReleases,
	getMaster,
	getMasterVersions,
	getRelease
} from '$lib/discogs/client';

import { parseNodeId } from '$lib/graph/operations/transformations';

import { discogsApi } from '$lib/discogs/discogs.svelte';

import { updateMasterNode } from '$lib/graph/operations/patches/nodes';

import {
	buildFromArtistReleases,
	buildFromLabelReleases,
	buildFromMasterVersions,
	buildMainReleaseFromMaster
} from '$lib/graph/operations/patches/releases';

import { runLoad } from './run-load';

import type { GraphInterface } from '$lib/graph/graph';

export async function loadReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				graph.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'release')
				);
				graph.visitedNodes.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				graph.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'release')
				);
				graph.visitedNodes.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
				break;
			}
			case 'master': {
				const versions = await getMasterVersions(discogsId, 1);
				graph.applyPatchFromExpansion(
					nodeId,
					buildFromMasterVersions(versions.versions, discogsId)
				);
				graph.visitedNodes.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
				break;
			}
		}
	}, 'Failed to load releases');
}

export async function loadMasterReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'artist': {
				const releases = await getArtistReleases(discogsId, 1);
				graph.applyPatchFromExpansion(
					nodeId,
					buildFromArtistReleases(releases.releases, discogsId, 'master')
				);
				graph.visitedNodes.setMasterReleasePages(
					nodeId,
					releases.pagination.page,
					releases.pagination.pages
				);
				break;
			}
			case 'label': {
				const releases = await getLabelReleases(discogsId, 1);
				graph.applyPatchFromExpansion(
					nodeId,
					buildFromLabelReleases(releases.releases, discogsId, 'master')
				);
				graph.visitedNodes.setMasterReleasePages(
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
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null || type !== 'master') return;

	await runLoad(graph, nodeId, async () => {
		let mainReleaseId = graph.data.nodes.get(nodeId)?.main_release?.id;

		if (!mainReleaseId) {
			const master = await getMaster(discogsId);
			await updateMasterNode(graph.data.nodes.get(nodeId)!, graph, master);
			graph.visitedNodes.markFetched(nodeId);
			mainReleaseId = master.main_release;
		}

		if (!mainReleaseId) {
			discogsApi.setError('This master has no main release');
			return;
		}

		const release = await getRelease(mainReleaseId);
		graph.applyPatchFromExpansion(nodeId, buildMainReleaseFromMaster(release, discogsId));
		graph.visitedNodes.markActionLoaded(nodeId, 'main_release');
	}, 'Failed to load main release');
}

export async function loadMoreReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	const paging = graph.visitedNodes.releasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	graph.visitedNodes.setLoading(nodeId, true);

	await discogsApi.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			graph.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'release')
			);
			graph.visitedNodes.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'label') {
			const releases = await getLabelReleases(discogsId, nextPage);
			graph.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'release')
			);
			graph.visitedNodes.setReleasePages(nodeId, releases.pagination.page, releases.pagination.pages);
		} else if (type === 'master') {
			const versions = await getMasterVersions(discogsId, nextPage);
			graph.applyPatchFromExpansion(
				nodeId,
				buildFromMasterVersions(versions.versions, discogsId)
			);
			graph.visitedNodes.setReleasePages(nodeId, versions.pagination.page, versions.pagination.pages);
		}
	}, 'Failed to load more releases');

	graph.visitedNodes.setLoading(nodeId, false);
}

export async function loadMoreMasterReleases(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null || (type !== 'artist' && type !== 'label')) return;

	const paging = graph.visitedNodes.masterReleasePages.get(nodeId);

	if (!paging || paging.page >= paging.pages) return;

	const nextPage = paging.page + 1;

	graph.visitedNodes.setLoading(nodeId, true);

	await discogsApi.withRequest(async () => {
		if (type === 'artist') {
			const releases = await getArtistReleases(discogsId, nextPage);
			graph.applyPatchFromExpansion(
				nodeId,
				buildFromArtistReleases(releases.releases, discogsId, 'master')
			);
			graph.visitedNodes.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		} else {
			const releases = await getLabelReleases(discogsId, nextPage);
			graph.applyPatchFromExpansion(
				nodeId,
				buildFromLabelReleases(releases.releases, discogsId, 'master')
			);
			graph.visitedNodes.setMasterReleasePages(
				nodeId,
				releases.pagination.page,
				releases.pagination.pages
			);
		}
	}, 'Failed to load more master releases');

	graph.visitedNodes.setLoading(nodeId, false);
}
