import type { NodeType } from '$lib/graph/types';

export type LoadAction =
	| 'artists'
	| 'labels'
	| 'releases'
	| 'master_releases'
	| 'main_release'
	| 'companies'
	| 'credited_artists'
	| 'aliases';

export const LOAD_ACTIONS: Record<NodeType, LoadAction[]> = {
	artist: ['artists', 'aliases', 'releases', 'master_releases'],
	label: ['labels', 'releases'],
	release: ['artists', 'labels', 'companies', 'credited_artists'],
	master: ['artists', 'releases', 'main_release']
};

export const LOAD_ACTION_LABELS: Record<LoadAction, string> = {
	artists: 'Load related artists',
	aliases: 'Load artist aliases',
	labels: 'Load related labels',
	releases: 'Load releases',
	master_releases: 'Load master releases',
	main_release: 'Load main release',
	companies: 'Load related companies',
	credited_artists: 'Load credited artists'
};

export type PagedLoadButtonState = {
	label: string;
	loaded: boolean;
	exhausted: boolean;
};
