import type { SearchType } from '$lib/discogs/types';

export type SearchableListItem = {
	key: string;
	label?: string;
	query?: string;
	discogsId?: number;
	searchType?: SearchType;
	artists?: { id: number; name: string }[];
	meta?: { year?: number | string; genres?: string[]; styles?: string[] };
};
