import type { GraphNode } from '$lib/graph/types';

export type ContextMenuAction =
	| 'artists'
	| 'labels'
	| 'releases'
	| 'master_releases'
	| 'main_release'
	| 'companies'
	| 'credited_artists';

export function getContextMenuActions(node: GraphNode): ContextMenuAction[] {
	switch (node.type) {
		case 'artist':
			return ['artists', 'releases', 'master_releases'];
		case 'label':
			return ['labels', 'releases', 'master_releases'];
		case 'release':
			return ['artists', 'labels', 'companies', 'credited_artists'];
		case 'master':
			return ['artists', 'releases', 'main_release'];
		default:
			return [];
	}
}

export function getPanelExploreActions(node: GraphNode): ContextMenuAction[] {
	switch (node.type) {
		case 'artist':
			return ['artists', 'labels', 'master_releases'];
		case 'label':
			return ['labels', 'releases'];
		case 'master':
			return ['artists', 'releases'];
		case 'release':
			return ['artists', 'companies', 'credited_artists'];
		default:
			return [];
	}
}
