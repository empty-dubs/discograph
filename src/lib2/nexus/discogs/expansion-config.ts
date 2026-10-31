import { plugin as source } from '../../plugins/discogs';

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

import type {
	Artist,
	ArtistReleasesResponse,
	EntityType,
	Label,
	LabelReleasesResponse,
	LoadType,
	Master,
	MasterVersionsResponse,
	Release
} from '../../plugins/discogs';
import type { GraphNode, GraphPatch } from '../../graph/types';

type DocumentPatchAction = {
	source: 'document';
	patch: (payload: unknown) => GraphPatch;
};

type ReleasesPatchAction = {
	source: 'releases';
	fetch: (externalId: number, page: number) => Promise<unknown>;
	patch: (entity: GraphNode, payload: unknown) => GraphPatch;
	expansionId: LoadType;
};

// TODO: maybe roll this behavior into DocumentPatchAction?
type CustomPatchAction = {
	source: 'custom';
	fetch: (node: GraphNode) => Promise<unknown>;
	patch: (node: GraphNode, payload: unknown) => GraphPatch;
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
		},
		release: {
			source: 'document',
			patch: (payload) => buildArtistsFromRelease(payload as Release),
		},
		master: {
			source: 'document',
			patch: (payload) => buildArtistsFromMaster(payload as Master),
		}
	},
	aliases: {
		artist: {
			source: 'document',
			patch: (payload) => buildAliasesFromArtist(payload as Artist),
		}
	},
	labels: {
		label: {
			source: 'document',
			patch: (payload) => buildFromLabel(payload as Label),
		},
		release: {
			source: 'document',
			patch: (payload) => buildLabelsFromRelease(payload as Release),
		}
	},
	companies: {
		release: {
			source: 'document',
			patch: (payload) => buildCompaniesFromRelease(payload as Release),
		}
	},
	credited_artists: {
		release: {
			source: 'document',
			patch: (payload) => buildCreditedArtistsFromRelease(payload as Release),
		}
	},
	releases: {
		artist: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => source.client.getArtistReleases(id, source.fetch.artistReleaseFetchParams(page)),
			patch: (artist, payload) => buildFromArtistReleases(artist, (payload as ArtistReleasesResponse).releases, 'release')
		},
		label: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => source.client.getLabelReleases(id, source.fetch.labelReleaseFetchParams(page)),
			patch: (label, payload) => buildFromLabelReleases(label, (payload as LabelReleasesResponse).releases, 'release')
		},
		master: {
			source: 'releases',
			expansionId: 'releases',
			fetch: (id, page) => source.client.getMasterVersions(id, source.fetch.masterVersionFetchParams(page)),
			patch: (master, payload) => buildFromMasterVersions(master, (payload as MasterVersionsResponse).versions)
		}
	},
	master_releases: {
		artist: {
			source: 'releases',
			expansionId: 'master_releases',
			fetch: (id, page) => source.client.getArtistReleases(id, source.fetch.artistReleaseFetchParams(page)),
			patch: (artist, payload) => buildFromArtistReleases(artist, (payload as ArtistReleasesResponse).releases, 'master')
		},
		label: {
			source: 'releases',
			expansionId: 'master_releases',
			fetch: (id, page) => source.client.getLabelReleases(id, source.fetch.labelReleaseFetchParams(page)),
			patch: (label, payload) => buildFromLabelReleases(label, (payload as LabelReleasesResponse).releases, 'master')
		}
	},
	main_release: {
		master: {
			source: 'custom',
			fetch: async (node) => {
				const document = source.stores.documentStore.get(node.id);
				const master: Master = document as Master;
				const mainReleaseId = master.main_release;

				if (!mainReleaseId) {
					throw new Error('This master has no main release');
				}

				return await source.client.getRelease(mainReleaseId);
			},
			patch: (node, payload) => buildMainReleaseFromMaster(payload as Release, node)
		}
	},
	linked_master: {
		release: {
			source: 'custom',
			fetch: async (node) => {
				const document = source.stores.documentStore.get(node.id);
				const release: Release = document as Release;
				const masterId = release.master_id;

				if (!masterId) {
					throw new Error('This release has no linked master');
				}

				return await source.client.getMaster(masterId);
			},
			patch: (node, payload) => buildMasterFromRelease(payload as Master, node)
		}
	}
};
