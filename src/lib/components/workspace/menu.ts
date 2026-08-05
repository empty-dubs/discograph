import type { GraphNode } from '$lib/graph/types';

export type ContextMenuAction = 'artists' | 'labels' | 'releases' | 'master_releases' | 'main_release';

export function getContextMenuActions(node: GraphNode): ContextMenuAction[] {
	switch (node.type) {
		case 'artist':
			return ['artists', 'releases', 'master_releases'];
		case 'label':
			return ['labels', 'releases', 'master_releases'];
		case 'release':
			return ['artists', 'labels'];
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
		default:
			return [];
	}
}
