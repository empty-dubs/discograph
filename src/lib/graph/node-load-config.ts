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

import type {
	Artist,
	ArtistReleasesResponse,
	Label,
	LabelReleasesResponse,
	Master,
	MasterVersionsResponse,
	Pagination,
	Release
} from '$lib/discogs/types';

import type { LoadAction } from '$lib/components/workspace/actions/constants';

import type { GraphInterface } from '$lib/graph/graph';

import {
	updateArtistNode,
	updateLabelNode,
	updateMasterNode,
	updateReleaseNode
} from '$lib/graph/operations/patches/nodes';

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

import type { GraphNode, GraphPatch, NodeType } from '$lib/graph/types';

type LoadContext = {
	graph: GraphInterface;
	node: GraphNode;
};

type DetailLoadEntry = {
	kind: 'detail';
	fetch: (discogsId: number) => Promise<unknown>;
	merge: (node: GraphNode, graph: GraphInterface, entity: any) => void | Promise<void>;
	errorMessage: string;
};

type ExpansionLoadEntry =
	| {
			kind: 'patch';
			fetch: (discogsId: number) => Promise<unknown> | void;
			patch: (payload: unknown, ctx?: LoadContext) => GraphPatch;
			markActionLoaded?: LoadAction;
	  }
	| {
			kind: 'paged';
			fetchPage: (discogsId: number, page: number) => Promise<unknown>;
			patch: (payload: unknown, ctx: LoadContext) => GraphPatch;
			getPaging: (graph: GraphInterface, nodeId: string) => { page: number; pages: number } | undefined;
			setPaging: (graph: GraphInterface, nodeId: string, pagination: Pagination) => void;
	  }
	| {
			kind: 'custom';
			run: (ctx: LoadContext) => Promise<void>;
	  };

export const DETAIL_CONFIG: Record<NodeType, DetailLoadEntry> = {
	artist: {
		kind: 'detail',
		fetch: getArtist,
		merge: updateArtistNode,
		errorMessage: 'Failed to load artist details'
	},
	label: {
		kind: 'detail',
		fetch: getLabel,
		merge: updateLabelNode,
		errorMessage: 'Failed to load label details'
	},
	master: {
		kind: 'detail',
		fetch: getMaster,
		merge: updateMasterNode,
		errorMessage: 'Failed to load master details'
	},
	release: {
		kind: 'detail',
		fetch: getRelease,
		merge: updateReleaseNode,
		errorMessage: 'Failed to load release details'
	}
};

export const LOAD_ACTION_CONFIG: Partial<
	Record<LoadAction, Partial<Record<NodeType, ExpansionLoadEntry>>>
> = {
	artists: {
		artist: {
			kind: 'patch',
			fetch: () => {},
			patch: (artist) => buildFromArtist(artist as Artist)
		},
		release: {
			kind: 'patch',
			fetch: () => {},
			patch: (release) => buildArtistsFromRelease(release as Release)
		},
		master: {
			kind: 'patch',
			fetch: () => {},
			patch: (master) => buildFromMaster(master as Master)
		}
	},
	aliases: {
		artist: {
			kind: 'patch',
			fetch: () => {},
			patch: (artist) => buildAliasesFromArtist(artist as Artist)
		}
	},
	labels: {
		label: {
			kind: 'patch',
			fetch: () => {},
			patch: (label) => buildFromLabel(label as Label)
		},
		release: {
			kind: 'patch',
			fetch: () => {},
			patch: (release) => buildLabelsFromRelease(release as Release)
		}
	},
	companies: {
		release: {
			kind: 'patch',
			fetch: () => {},
			patch: (release) => buildCompaniesFromRelease(release as Release)
		}
	},
	credited_artists: {
		release: {
			kind: 'patch',
			fetch: () => {},
			patch: (release) => buildCreditedArtistsFromRelease(release as Release)
		}
	},
	releases: {
		artist: {
			kind: 'paged',
			fetchPage: getArtistReleases,
			patch: (payload, ctx) =>
				buildFromArtistReleases(
					(payload as ArtistReleasesResponse).releases,
					ctx.node,
					'release'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages, pagination.items)
		},
		label: {
			kind: 'paged',
			fetchPage: getLabelReleases,
			patch: (payload, ctx) =>
				buildFromLabelReleases(
					(payload as LabelReleasesResponse).releases,
					ctx.node,
					'release'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages, pagination.items)
		},
		master: {
			kind: 'paged',
			fetchPage: getMasterVersions,
			patch: (payload, ctx) =>
				buildFromMasterVersions(
					(payload as MasterVersionsResponse).versions,
					ctx.node
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.releasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setReleasePages(nodeId, pagination.page, pagination.pages, pagination.items)
		}
	},
	master_releases: {
		artist: {
			kind: 'paged',
			fetchPage: getArtistReleases,
			patch: (payload, ctx) =>
				buildFromArtistReleases(
					(payload as ArtistReleasesResponse).releases,
					ctx.node,
					'master'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.masterReleasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setMasterReleasePages(nodeId, pagination.page, pagination.pages, pagination.items)
		},
		label: {
			kind: 'paged',
			fetchPage: getLabelReleases,
			patch: (payload, ctx) =>
				buildFromLabelReleases(
					(payload as LabelReleasesResponse).releases,
					ctx.node,
					'master'
				),
			getPaging: (graph, nodeId) => graph.visitedNodes.masterReleasePages.get(nodeId),
			setPaging: (graph, nodeId, pagination) =>
				graph.visitedNodes.setMasterReleasePages(nodeId, pagination.page, pagination.pages, pagination.items)
		}
	},
	main_release: {
		master: {
			kind: 'custom',
			run: async ({ graph, node }) => {
				let mainReleaseId = graph.data.nodes.get(node.id)?.main_release_info?.id;

				// If the master has no main release, fetch the master and set the main release
				// Likely leftover from a previous implementation where nodes were only partially loaded
				// This doesn't do anything right now because the master should already be loaded
				// TODO: Remove this after further consideration of lazy loading
				if (!mainReleaseId) {
					const master = await getMaster(node.discogsId!);

					await updateMasterNode(graph.data.nodes.get(node.id)!, graph, master);

					mainReleaseId = master.main_release;
				}

				if (!mainReleaseId) {
					discogsApi.setError('This master has no main release');
					return;
				}

				const release = await getRelease(mainReleaseId);

				graph.applyPatchFromExpansion(node.id, buildMainReleaseFromMaster(release, node));
				graph.visitedNodes.markActionLoaded(node.id, 'main_release');
			}
		}
	}
};
