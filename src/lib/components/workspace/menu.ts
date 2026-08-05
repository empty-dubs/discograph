import type { GraphNode } from '$lib/graph/types';

export type ContextMenuAction = 'artists' | 'labels' | 'releases';

export function getContextMenuActions(node: GraphNode): ContextMenuAction[] {
	switch (node.type) {
		case 'artist':
			return ['artists', 'releases'];
		case 'label':
			return ['labels', 'releases'];
		case 'release':
			return ['artists', 'labels'];
		case 'master':
			return ['artists', 'releases'];
		default:
			return [];
	}
}
