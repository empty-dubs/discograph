import type { SearchType } from '../../plugins/discogs';

export type LoadButtonState = {
	label: string;
	loaded: boolean;
	exhausted: boolean;
	type: string;
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
