import type { GraphNode } from '$lib/graph/types';

export type ContextMenuAction =
	| 'artists'
	| 'labels'
	| 'releases'
	| 'master_releases'
	| 'main_release'
	| 'companies'
	| 'credited_artists'
	| 'aliases';

export function getContextMenuActions(node: GraphNode): ContextMenuAction[] {
	switch (node.type) {
		case 'artist':
			return ['artists', 'aliases', 'releases', 'master_releases'];
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
			return ['artists', 'aliases', 'master_releases', 'releases'];
		case 'label':
			return ['labels', 'master_releases', 'releases'];
		case 'master':
			return ['artists', 'releases'];
		case 'release':
			return ['artists', 'labels', 'companies', 'credited_artists'];
		default:
			return [];
	}
}
