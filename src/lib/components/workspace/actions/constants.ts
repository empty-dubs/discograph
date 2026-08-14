import type { GraphNode, NodeType } from '$lib/graph/types';

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

export function getLoadButtonState(
	loadedActions: Map<string, Set<LoadAction>>,
	nodeId: string,
	action: LoadAction
): PagedLoadButtonState {
	const loaded = loadedActions.get(nodeId)?.has(action) ?? false;

	return {
		loaded,
		label: LOAD_ACTION_LABELS[action],
		exhausted: loaded
	};
}

export function hasRelatedArtists(node: GraphNode): boolean {
	if (node.type !== 'artist') return true;

	return (node.members?.length ?? 0) > 0 || (node.groups?.length ?? 0) > 0;
}

export function hasRelatedLabels(node: GraphNode): boolean {
	if (node.type !== 'label') return true;

	return Boolean(node.parent_label) || (node.sublabels?.length ?? 0) > 0;
}

export function hasRelatedAliases(node: GraphNode): boolean {
	if (node.type !== 'artist') return true;

	return (node.aliases?.length ?? 0) > 0;
}

export function hasMainRelease(node: GraphNode, isDetailsFetched: boolean): boolean {
	if (node.type !== 'master') return true;

	if (node.main_release) return true;

	return !isDetailsFetched;
}

export function getVisibleLoadActions(
	node: GraphNode,
	isDetailsFetched: boolean
): LoadAction[] {
	return LOAD_ACTIONS[node.type].filter((action) => {
		if (action === 'artists' && !hasRelatedArtists(node)) return false;
		if (action === 'labels' && !hasRelatedLabels(node)) return false;
		if (action === 'aliases' && !hasRelatedAliases(node)) return false;
		if (action === 'main_release' && !hasMainRelease(node, isDetailsFetched)) return false;

		return true;
	});
}
