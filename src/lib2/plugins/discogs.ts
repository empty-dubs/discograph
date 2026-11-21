import { search } from '../sources/discogs/client';
import {
	getRelationshipId,
	getEntityId,
	getDiscogsWebsiteUrl,
	getYouTubeSearchUrl,
} from '../sources/discogs/compositions';
import {
	ARTIST_GROUPS,
	ARTIST_LOAD_TYPES,
	ENTITY_NEIGHBOR_TYPES,
	LABEL_GROUPS,
	LABEL_LOAD_TYPES,
	LOAD_TYPE_LABELS,
	MASTER_RELEASE_GROUPS,
	MASTER_RELEASE_LOAD_TYPES,
	RELATED_ENTITY_TYPE_MAP,
	RELEASES_TAB_LOAD_TYPES,
} from '../sources/discogs/constants';
import {
	fetchEntityDocument,
	fetchLinkedMasterDocument,
	fetchMainReleaseDocument,
	fetchPagedDocument,
	isBlocked
} from '../sources/discogs/fetch';
import { presentation } from '../sources/discogs/presentation';
import {
	getRelatedEntities,
	getRelatedEntityGroups,
} from '../sources/discogs/queries/related-entities';
import { getReleases, getTotalReleasesCount, hasReleaseData, isReleaseParentType } from '../sources/discogs/queries/releases';
import { clear } from '../sources/discogs/session';
import { entityLabel, normalizeProfileText } from '../sources/discogs/transformations';

import { documentStore } from '../sources/discogs/stores/documents.svelte';
import { fetchError } from '../sources/discogs/stores/fetch-error.svelte';
import { fetchStatus } from '../sources/discogs/stores/fetch-statuses.svelte';
import { loadProgress } from '../sources/discogs/stores/load-progress.svelte';
import { pagedDocumentStore } from '../sources/discogs/stores/paged-documents.svelte';
import { releasesStore } from '../sources/discogs/stores/releases.svelte';

import { getEntityInformation } from '../sources/discogs/queries/entity';

export type {
	Artist,
	ArtistRelease,
	ArtistReleasesResponse,
	EntityDocument,
	EntityInformation,
	EntityType,
	NavigationPayload,
	Label,
	LabelRelease,
	LabelReleasesResponse,
	LoadType,
	Master,
	MasterVersion,
	MasterVersionsResponse,
	PagedDocument,
	RelatedEntityType,
	RelationshipType,
	Release,
	SearchResult,
	Track
} from '../sources/discogs/types';

export const plugin = {
	id: 'discogs',
	stores: {
		documentStore,
		fetchError,
		fetchStatus,
		loadProgress,
		pagedDocumentStore,
		releasesStore,
	},
	queries: {
		getEntityInformation
	},
	client: {
		search
	},
	presentation,
	transformations: {
		entityLabel,
		normalizeProfileText
	},
	compositions: {
		getDiscogsWebsiteUrl,
		getEntityId,
		getRelationshipId,
		getYouTubeSearchUrl,
	},
	constants: {
		artistGroups: ARTIST_GROUPS,
		artistLoadTypes: ARTIST_LOAD_TYPES,
		labelGroups: LABEL_GROUPS,
		labelLoadTypes: LABEL_LOAD_TYPES,
		loadTypeLabels: LOAD_TYPE_LABELS,
		masterReleaseGroups: MASTER_RELEASE_GROUPS,
		masterReleaseLoadTypes: MASTER_RELEASE_LOAD_TYPES,
		releasesTabLoadTypes: RELEASES_TAB_LOAD_TYPES,
		neighborTypes: ENTITY_NEIGHBOR_TYPES,
		relatedEntityTypeMap: RELATED_ENTITY_TYPE_MAP
	},
	fetch: {
		fetchEntityDocument,
		fetchPagedDocument,
		fetchMainReleaseDocument,
		fetchLinkedMasterDocument,
		isBlocked
	},
	relatedEntities: {
		getRelatedEntities,
		getRelatedEntityGroups,
	},
	releases: {
		getReleases,
		getTotalReleasesCount,
		hasReleaseData,
		isReleaseParentType
	},
	session: {
		clear
	}
};
