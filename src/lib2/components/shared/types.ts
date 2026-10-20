import type { EntityType } from '../../plugins/discogs';

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
	entityType?: EntityType;
	artists?: { id: number; name: string }[];
	meta?: { year?: number | string; genres?: string[]; styles?: string[] };
};
