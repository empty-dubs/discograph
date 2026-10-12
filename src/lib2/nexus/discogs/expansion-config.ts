import { graph } from '../../graph/graph';
import { discogsPlugin as discogs } from '../../plugins/discogs';

import {
	buildAliasesFromArtist,
	buildArtistsFromMaster,
	buildArtistsFromRelease,
	buildCreditedArtistsFromRelease,
	buildFromArtist
} from './patches/artists';
import {
	buildCompaniesFromRelease,
	buildFromLabel,
	buildLabelsFromRelease
} from './patches/labels';
import {
	buildFromArtistReleases,
	buildFromLabelReleases,
	buildFromMasterVersions,
	buildMainReleaseFromMaster,
	buildMasterFromRelease
} from './patches/releases';
import {
	hasMoreDiscogsExpansionPages,
	setDiscogsExpansionPaging
} from './expansion-session';

import type {
	Artist,
	ArtistReleasesResponse,
	EntityType,
	Label,
	LabelReleasesResponse,
	LoadType,
	Master,
	MasterVersionsResponse,
	Pagination,
	Release
} from '../../plugins/discogs';
import type { GraphNode, GraphPatch } from '../../graph/types';

type DocumentPatchAction = {
	source: 'document';
	patch: (payload: unknown) => GraphPatch;
	markCompleted?: LoadType;
};

type ReleasesPatchAction = {
	source: 'releases';
	fetch: (externalId: number, page: number) => Promise<unknown>;
	patch: (payload: unknown) => GraphPatch;
	expansionId: LoadType;
};

// TODO: maybe roll this behavior into DocumentPatchAction?
type CustomPatchAction = {
	source: 'custom';
	run: (node: GraphNode) => Promise<void>;
};

export type LoadAction = DocumentPatchAction | ReleasesPatchAction | CustomPatchAction;

export const LOAD_ACTION_CONFIG: Partial<Record<
	LoadType,
	Partial<Record<
		EntityType,
		LoadAction
	>>
>> = {
	artists: {
		artist: {
			source: 'document',
			patch: (payload) => buildFromArtist(payload as Artist),
			markCompleted: 'artists'
		},
		release: {
			source: 'document',
			patch: (payload) => buildArtistsFromRelease(payload as Release),
			markCompleted: 'artists'
		},
		master: {
			source: 'document',
			patch: (payload) => buildArtistsFromMaster(payload as Master),
			markCompleted: 'artists'
		}
	},
	aliases: {
		artist: {
			source: 'document',
			patch: (payload) => buildAliasesFromArtist(payload as Artist),
			markCompleted: 'aliases'
		}
	},
	labels: {
		label: {
			source: 'document',
			patch: (payload) => buildFromLabel(payload as Label),
			markCompleted: 'labels'
		},
		release: {
			source: 'document',
			patch: (payload) => buildLabelsFromRelease(payload as Release),
			markCompleted: 'labels'
		}
	},
	companies: {
		release: {
			source: 'document',
			patch: (payload) => buildCompaniesFromRelease(payload as Release),
			markCompleted: 'companies'
		}
	},
	credited_artists: {
		release: {
			source: 'document',
			patch: (payload) => buildCreditedArtistsFromRelease(payload as Release),
			markCompleted: 'credited_artists'
		}
	},
	releases: {
		artist: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => discogs.client.getArtistReleases(id, discogs.fetch.artistReleaseFetchParams(page)),
			patch: (payload) => buildFromArtistReleases((payload as ArtistReleasesResponse).releases, 'release')
		},
		label: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => discogs.client.getLabelReleases(id, discogs.fetch.labelReleaseFetchParams(page)),
			patch: (payload) => buildFromLabelReleases((payload as LabelReleasesResponse).releases, 'release')
		},
		master: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => discogs.client.getMasterVersions(id, discogs.fetch.masterVersionFetchParams(page)),
			patch: (payload) => buildFromMasterVersions((payload as MasterVersionsResponse).versions)
		}
	},
	master_releases: {
		artist: {
			source: 'releases',
			expansionId: 'master_releases',
			fetch: (id, page) => discogs.client.getArtistReleases(id, discogs.fetch.artistReleaseFetchParams(page)),
			patch: (payload) => buildFromArtistReleases((payload as ArtistReleasesResponse).releases, 'master')
		},
		label: {
			source: 'releases',
			expansionId: 'master_releases',
			fetch: (id, page) => discogs.client.getLabelReleases(id, discogs.fetch.labelReleaseFetchParams(page)),
			patch: (payload) => buildFromLabelReleases((payload as LabelReleasesResponse).releases, 'master')
		}
	},
	main_release: {
		master: {
			source: 'custom',
			run: async (node) => {
				const document = discogs.documentStore.get(node.id);
				const master: Master = document as Master;
				const mainReleaseId = master.main_release;

				if (!mainReleaseId) {
					throw new Error('This master has no main release');
				}

				const release = await discogs.client.getRelease(mainReleaseId);

				graph.applyPatchFromExpansion(node.id, buildMainReleaseFromMaster(release, node));
			}
		}
	},
	linked_master: {
		release: {
			source: 'custom',
			run: async (node) => {
				const document = discogs.documentStore.get(node.id);
				const release: Release = document as Release;
				const masterId = release.master_id;

				if (!masterId) {
					throw new Error('This release has no linked master');
				}
				const master = await discogs.client.getMaster(masterId);

				graph.applyPatchFromExpansion(node.id, buildMasterFromRelease(master, node));
			}
		}
	}
};

export function getExpansionPaging(nodeId: string, loadType: LoadType) {
	return graph.expansion.expansionPagingByNodeId.get(nodeId)?.get(loadType);
}

export function applyExpansionPaging(nodeId: string, loadType: LoadType, pagination: Pagination) {
	setDiscogsExpansionPaging(nodeId, loadType, pagination.page, pagination.pages, pagination.items);

	if (pagination.page >= pagination.pages) {
		graph.expansion.markExpansionCompleted(nodeId, loadType);
	}
}

export function pagingHasMore(nodeId: string, loadType: LoadType): boolean {
	return hasMoreDiscogsExpansionPages(nodeId, loadType);
}
