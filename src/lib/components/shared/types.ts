import type { SearchType } from '$lib/discogs/types';

export type CrawlMode = 'artist-artist' | 'label-label';

export type DiscoverEntitySectionId =
	| 'aliases'
	| 'members'
	| 'groups'
	| 'parent-label'
	| 'sublabels'
	| 'main-release'
	| 'linked-master'
	| 'artists'
	| 'labels'
	| 'credits'
	| 'companies';

export type LoadAction =
	| 'artists'
	| 'labels'
	| 'releases'
	| 'master_releases'
	| 'main_release'
	| 'linked_master'
	| 'companies'
	| 'credited_artists'
	| 'aliases';

export type PagedLoadButtonState = {
	label: string;
	loaded: boolean;
	exhausted: boolean;
};


export type SearchableListItem = {
	key: string;
	label?: string;
	query?: string;
	discogsId?: number;
	searchType?: SearchType;
	artists?: { id: number; name: string }[];
	meta?: { year?: number | string; genres?: string[]; styles?: string[] };
};
