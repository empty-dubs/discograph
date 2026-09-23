import type { EdgeType, NodeType } from './types';

export const ALL_NODE_TYPES: NodeType[] = ['artist', 'label', 'master', 'release'];

export const ARTIST_NODE_TYPES: NodeType[] = ['artist'];
export const MASTER_RELEASE_NODE_TYPES: NodeType[] = ['master', 'release'];
export const LABEL_NODE_TYPES: NodeType[] = ['label'];

export const ALL_EDGE_TYPES: EdgeType[] = [
	'member_of',
	'alias_of',
	'released',
	'version_of',
	'credited_on',
	'sublabel_of',
	'on_label',
	'company_on',
];

export const ARTIST_EDGE_TYPES: EdgeType[] = ['member_of', 'alias_of', 'credited_on'];
export const MASTER_RELEASE_EDGE_TYPES: EdgeType[] = ['released', 'version_of'];
export const LABEL_EDGE_TYPES: EdgeType[] = [
	'sublabel_of',
	'on_label',
	'company_on',
];

export const NODE_COLORS: Record<NodeType, string> = {
	artist: '#4a90d9',
	label: '#50b86a',
	master: '#9b59b6',
	release: '#e8943a'
};

export const NODE_RADIUS: Record<NodeType, number> = {
	artist: 14,
	label: 12,
	master: 11,
	release: 10
};

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
	member_of: 'Membership',
	alias_of: 'Aliases',
	released: 'Artist releases',
	version_of: 'Release versions',
	credited_on: 'Credits',
	sublabel_of: 'Sublabels',
	on_label: 'Label releases',
	company_on: 'Companies',
};
