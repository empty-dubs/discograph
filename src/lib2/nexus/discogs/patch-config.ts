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

import type { GraphNode, GraphPatch } from '../../graph/types';
import type {
	Artist,
	ArtistReleasesResponse,
	EntityDocument,
	EntityType,
	Label,
	LabelReleasesResponse,
	LoadType,
	Master,
	MasterVersionsResponse,
	PagedDocument,
	Release
} from '../../plugins/discogs';

type DocumentPatchAction = {
	source: 'document';
	patch: (payload: EntityDocument) => GraphPatch;
};

type ReleasesPatchAction = {
	source: 'releases';
	patch: (entity: GraphNode, payload: PagedDocument) => GraphPatch;
};

type CustomPatchAction = {
	source: 'custom';
	patch: (node: GraphNode, payload: EntityDocument) => GraphPatch;
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
			patch: (artist, payload) => buildFromArtistReleases(artist, (payload as ArtistReleasesResponse).releases, 'release')
		},
		label: {
			source: 'releases',
			patch: (label, payload) => buildFromLabelReleases(label, (payload as LabelReleasesResponse).releases)
		},
		master: {
			source: 'releases',
			patch: (master, payload) => buildFromMasterVersions(master, (payload as MasterVersionsResponse).versions)
		}
	},
	master_releases: {
		artist: {
			source: 'releases',
			patch: (artist, payload) => buildFromArtistReleases(artist, (payload as ArtistReleasesResponse).releases, 'master')
		}
	},
	main_release: {
		master: {
			source: 'custom',
			patch: (node, payload) => buildMainReleaseFromMaster(payload as Release, node)
		}
	},
	linked_master: {
		release: {
			source: 'custom',
			patch: (node, payload) => buildMasterFromRelease(payload as Master, node)
		}
	}
};
