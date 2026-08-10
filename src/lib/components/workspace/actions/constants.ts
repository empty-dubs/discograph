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

export type PagedLoadButtonState = {
	label: string;
	loaded: boolean;
	exhausted: boolean;
};

export function getReleasesButtonState(
	releasePages: Map<string, { page: number; pages: number }>,
	nodeId: string,
	hasMore: boolean
): PagedLoadButtonState {
	const loaded = releasePages.has(nodeId);

	return {
		loaded,
		label: loaded ? 'Load more releases' : 'Load releases',
		exhausted: loaded && !hasMore
	};
}

export function getMasterReleasesButtonState(
	masterReleasePages: Map<string, { page: number; pages: number }>,
	nodeId: string,
	hasMore: boolean
): PagedLoadButtonState {
	const loaded = masterReleasePages.has(nodeId);

	return {
		loaded,
		label: loaded ? 'Load more master releases' : 'Load master releases',
		exhausted: loaded && !hasMore
	};
}
