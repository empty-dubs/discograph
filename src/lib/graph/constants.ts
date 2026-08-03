import type { NodeType } from './types';

export const ALL_NODE_TYPES: NodeType[] = ['artist', 'label', 'master', 'release', 'track'];

export const NODE_COLORS: Record<NodeType, string> = {
	artist: '#4a90d9',
	label: '#50b86a',
	master: '#9b59b6',
	release: '#e8943a',
	track: '#95a5a6'
};

export const NODE_RADIUS: Record<NodeType, number> = {
	artist: 14,
	label: 12,
	master: 11,
	release: 10,
	track: 6
};
