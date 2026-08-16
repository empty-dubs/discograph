import {
	getArtist,
	getArtistReleases,
	getLabel,
	getLabelReleases,
	getMaster,
	getMasterVersions,
	getRelease
} from '$lib/discogs/client';

import { discogsApi } from '$lib/discogs/discogs.svelte';

import type { Artist, ArtistReleasesResponse, Label, LabelReleasesResponse, Master, MasterVersionsResponse, Pagination, Release } from '$lib/discogs/types';

import type { GraphInterface } from '$lib/graph/graph';

import { updateMasterNode } from '$lib/graph/operations/patches/nodes';

import {
	buildFromArtist,
	buildAliasesFromArtist,
	buildArtistsFromRelease,
	buildCreditedArtistsFromRelease,
	buildFromMaster
} from '$lib/graph/operations/patches/artists';

import {
	buildCompaniesFromRelease,
	buildFromLabel,
	buildLabelsFromRelease
} from '$lib/graph/operations/patches/labels';

import {
	buildFromArtistReleases,
	buildFromLabelReleases,
	buildFromMasterVersions,
	buildMainReleaseFromMaster
} from '$lib/graph/operations/patches/releases';

import type { GraphPatch, NodeType } from '$lib/graph/types';

import type { LoadAction } from '../constants';

export type LoadContext = {
	graph: GraphInterface;
	nodeId: string;
	discogsId: number;
};

export type NodeLoadEntry =
	| {
			kind: 'patch';
			fetch: (discogsId: number) => Promise<unknown>;
			toPatch: (payload: unknown, ctx: LoadContext) => GraphPatch;
			markActionLoaded?: LoadAction;
	  }
	| {
			kind: 'paged';
			fetchPage: (discogsId: number, page: number) => Promise<unknown>;
			toPatch: (payload: unknown, ctx: LoadContext) => GraphPatch;
			getPaging: (graph: GraphInterface, nodeId: string) => { page: number; pages: number } | undefined;
			setPaging: (graph: GraphInterface, nodeId: string, pagination: Pagination) => void;
	  }
	| {
			kind: 'custom';
			run: (ctx: LoadContext) => Promise<void>;
	  };

export const LOAD_ACTION_CONFIG: Partial<
	Record<LoadAction, Partial<Record<NodeType, NodeLoadEntry>>>
> = {
	artists: {
		artist: {
			kind: 'patch',
			fetch: getArtist,
			toPatch: (artist) => buildFromArtist(artist as Artist)
		},
		release: {
			kind: 'patch',
			fetch: getRelease,
			toPatch: (release) => buildArtistsFromRelease(release as Release)
		},
		master: {
			kind: 'patch',
			fetch: getMaster,
			toPatch: (master) => buildFromMaster(master as Master)
		}
	},
	aliases: {
		artist: {
			kind: 'patch',
			fetch: getArtist,
			toPatch: (artist) => buildAliasesFromArtist(artist as Artist)
		}
	},
	labels: {
		label: {
			kind: 'patch',
			fetch: getLabel,
			toPatch: (label) => buildFromLabel(label as Label)
		},
		release: {
			kind: 'patch',
			fetch: getRelease,
			toPatch: (release) => buildLabelsFromRelease(release as Release)
		}
	},
	companies: {
		release: {
			kind: 'patch',
			fetch: getRelease,
			toPatch: (release) =>
				buildCompaniesFromRelease(release as Release)
		}
	},
	credited_artists: {
		release: {
			kind: 'patch',
			fetch: getRelease,
			toPatch: (release) =>
				buildCreditedArtistsFromRelease(release as Release)
		}
	},
	releases: {
		artist: {
			kind: 'paged',
			fetchPage: getArtistReleases,
			toPatch: (payload, ctx) =>
				buildFromArtistReleases(
					(payload as ArtistReleasesResponse).releases,
					ctx.discogsId,
					'release'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages)
		},
		label: {
			kind: 'paged',
			fetchPage: getLabelReleases,
			toPatch: (payload, ctx) =>
				buildFromLabelReleases(
					(payload as LabelReleasesResponse).releases,
					ctx.discogsId,
					'release'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages)
		},
		master: {
			kind: 'paged',
			fetchPage: getMasterVersions,
			toPatch: (payload, ctx) =>
				buildFromMasterVersions(
					(payload as MasterVersionsResponse).versions,
					ctx.discogsId
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages)
		}
	},
	master_releases: {
		artist: {
			kind: 'paged',
			fetchPage: getArtistReleases,
			toPatch: (payload, ctx) =>
				buildFromArtistReleases(
					(payload as ArtistReleasesResponse).releases,
					ctx.discogsId,
					'master'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.masterReleasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setMasterReleasePages(nodeId, pagination.page, pagination.pages)
		},
		label: {
			kind: 'paged',
			fetchPage: getLabelReleases,
			toPatch: (payload, ctx) =>
				buildFromLabelReleases(
					(payload as LabelReleasesResponse).releases,
					ctx.discogsId,
					'master'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.masterReleasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setMasterReleasePages(nodeId, pagination.page, pagination.pages)
		}
	},
	main_release: {
		master: {
			kind: 'custom',
			run: async ({ graph, nodeId, discogsId }) => {
				let mainReleaseId = graph.data.nodes.get(nodeId)?.main_release?.id;

				if (!mainReleaseId) {
					const master = await getMaster(discogsId);
					await updateMasterNode(graph.data.nodes.get(nodeId)!, graph, master);
					mainReleaseId = master.main_release;
				}

				if (!mainReleaseId) {
					discogsApi.setError('This master has no main release');
					return;
				}

				const release = await getRelease(mainReleaseId);
				graph.applyPatchFromExpansion(nodeId, buildMainReleaseFromMaster(release, discogsId));
				graph.visitedNodes.markActionLoaded(nodeId, 'main_release');
			}
		}
	}
};
