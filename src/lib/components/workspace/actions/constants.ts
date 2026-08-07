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
	label: ['labels', 'releases', 'master_releases'],
	release: ['artists', 'labels', 'companies', 'credited_artists'],
	master: ['artists', 'releases', 'main_release']
};
