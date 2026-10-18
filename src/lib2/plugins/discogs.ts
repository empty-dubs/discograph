import { documentStore } from '../sources/discogs/document-store.svelte';
import { loadProgress } from '../sources/discogs/load-progress.svelte';
import {
	getArtist,
	getLabel,
	getRelease,
	getMaster,
	getArtistReleases,
	getLabelReleases,
	getMasterVersions,
	search,
} from '../sources/discogs/client';
import { isBlocked } from '../sources/discogs/blocked';
import { getRelationshipId, getEntityId, getDiscogsWebsiteUrl, getYouTubeSearchUrl } from '../sources/discogs/compositions';
import {
	ARTIST_GROUPS,
	ARTIST_LOAD_TYPES,
	ENTITY_NEIGHBOR_TYPES,
	LABEL_GROUPS,
	LABEL_LOAD_TYPES,
	LOAD_TYPE_LABELS,
	MASTER_RELEASE_GROUPS,
	MASTER_RELEASE_LOAD_TYPES,
	PATCH_LOAD_TYPES,
} from '../sources/discogs/constants';
import { entityLabel } from '../sources/discogs/transformations';
import { presentation } from '../sources/discogs/presentation';
import {
	fetchEntityDocument,
	entityFetchErrorMessage,
	artistReleaseFetchParams,
	labelReleaseFetchParams,
	masterVersionFetchParams,
} from '../sources/discogs/fetch';

export type {
	Artist,
	ArtistRelease,
	ArtistReleasesResponse,
	EntityType,
	Label,
	LabelRelease,
	LabelReleasesResponse,
	LoadType,
	Master,
	MasterVersion,
	MasterVersionsResponse,
	PagedListParams,
	Pagination,
	RelationshipType,
	Release,
	SearchResponse,
	SearchResult,
	SearchType
} from '../sources/discogs/types';

export const discogsPlugin = {
	id: 'discogs',
	documentStore,
	loadProgress,
	client: {
		getArtist,
		getLabel,
		getRelease,
		getMaster,
		getArtistReleases,
		getLabelReleases,
		getMasterVersions,
		search
	},
	isBlocked,
	presentation,
	transformations: {
		entityLabel,
	},
	compositions: {
		getDiscogsWebsiteUrl,
		getEntityId,
		getRelationshipId,
		getYouTubeSearchUrl
	},
	constants: {
		artistGroups: ARTIST_GROUPS,
		artistLoadTypes: ARTIST_LOAD_TYPES,
		labelGroups: LABEL_GROUPS,
		labelLoadTypes: LABEL_LOAD_TYPES,
		loadTypeLabels: LOAD_TYPE_LABELS,
		masterReleaseGroups: MASTER_RELEASE_GROUPS,
		masterReleaseLoadTypes: MASTER_RELEASE_LOAD_TYPES,
		neighborTypes: ENTITY_NEIGHBOR_TYPES,
		patchLoadTypes: PATCH_LOAD_TYPES
	},
	fetch: {
		fetchEntityDocument,
		entityFetchErrorMessage,
		artistReleaseFetchParams,
		labelReleaseFetchParams,
		masterVersionFetchParams
	}
};
