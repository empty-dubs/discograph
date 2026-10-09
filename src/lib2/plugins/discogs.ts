import { documentStore } from '../sources/discogs/document-store.svelte';
import * as client from '../sources/discogs/client';
import { isBlocked } from '../sources/discogs/blocked';
import { linkId, nodeId } from '../sources/discogs/compositions';
import { LOAD_ACTIONS, LOAD_ACTION_LABELS } from '../sources/discogs/constants';
import { entityLabel } from '../sources/discogs/transformations';
import { graphPresentation } from '../sources/discogs/presentation';
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
		nodeId: (type: string, externalId: string | number) => string;
		linkId: (source: string, type: string, target: string) => string;
	};
	constants: {
		loadActions: typeof LOAD_ACTIONS;
		loadActionLabels: typeof LOAD_ACTION_LABELS;
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
	LoadAction,
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
		nodeId,
		linkId
	},
	constants: {
		loadActions: LOAD_ACTIONS,
		loadActionLabels: LOAD_ACTION_LABELS
	}
} satisfies SourcePlugin;
