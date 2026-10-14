import { documentStore } from '../sources/discogs/document-store.svelte';
import * as client from '../sources/discogs/client';
import { isBlocked } from '../sources/discogs/blocked';
import { getRelationshipId, getEntityId } from '../sources/discogs/compositions';
import { ENTITY_NEIGHBOR_TYPES, LOAD_TYPE_LABELS, PATCH_LOAD_TYPES } from '../sources/discogs/constants';
import { entityLabel } from '../sources/discogs/transformations';
import { graphPresentation } from '../sources/discogs/presentation';
import {
	fetchEntityDocument,
	entityFetchErrorMessage,
	artistReleaseFetchParams,
	labelReleaseFetchParams,
	masterVersionFetchParams,
} from '../sources/discogs/fetch';

import type { SearchResult, SearchType } from '../sources/discogs/types';

interface SourcePlugin {
	id: string;
	documentStore: typeof documentStore;
	client: typeof client;
	isBlocked: (type: SearchType, id: number) => boolean;
	presentation: typeof graphPresentation;
	transformations: {
		entityLabel: (result: Pick<SearchResult, 'title' | 'name' | 'type'>) => string;
	};
	compositions: {
		getEntityId: (type: string, externalId: string | number) => string;
		getRelationshipId: (source: string, type: string, target: string) => string;
	};
	constants: {
		neighborTypes: typeof ENTITY_NEIGHBOR_TYPES;
		loadTypeLabels: typeof LOAD_TYPE_LABELS;
		patchLoadTypes: typeof PATCH_LOAD_TYPES;
	};
	fetch: {
		fetchEntityDocument: typeof fetchEntityDocument;
		entityFetchErrorMessage: typeof entityFetchErrorMessage;
		artistReleaseFetchParams: typeof artistReleaseFetchParams;
		labelReleaseFetchParams: typeof labelReleaseFetchParams;
		masterVersionFetchParams: typeof masterVersionFetchParams;
	};
}

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
	client,
	isBlocked,
	presentation: graphPresentation,
	transformations: {
		entityLabel,
	},
	compositions: {
		getEntityId,
		getRelationshipId
	},
	constants: {
		neighborTypes: ENTITY_NEIGHBOR_TYPES,
		loadTypeLabels: LOAD_TYPE_LABELS,
		patchLoadTypes: PATCH_LOAD_TYPES
	},
	fetch: {
		fetchEntityDocument,
		entityFetchErrorMessage,
		artistReleaseFetchParams,
		labelReleaseFetchParams,
		masterVersionFetchParams
	}
} satisfies SourcePlugin;
