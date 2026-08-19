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
	'parent_label',
	'sublabel_of',
	'on_label',
	'company_on',
];

export const ARTIST_EDGE_TYPES: EdgeType[] = ['member_of', 'alias_of', 'credited_on'];
export const MASTER_RELEASE_EDGE_TYPES: EdgeType[] = ['released', 'version_of'];
export const LABEL_EDGE_TYPES: EdgeType[] = [
	'parent_label',
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

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
	artist: 'Artists',
	label: 'Labels',
	master: 'Masters',
	release: 'Releases'
};

export const NODE_RADIUS: Record<NodeType, number> = {
	artist: 14,
	label: 12,
	master: 11,
	release: 10
};

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
	member_of: 'Member of',
	alias_of: 'Alias of',
	released: 'Released',
	version_of: 'Version of',
	credited_on: 'Credited on',
	parent_label: 'Parent label',
	sublabel_of: 'Sublabel of',
	on_label: 'On label',
	company_on: 'Company on',
};

export const EDGE_COLORS: Record<EdgeType, string> = {
	member_of: '#6eb5ff',
	alias_of: '#6eb5ff',
	released: '#f59e0b',
	version_of: '#c084fc',
	credited_on: '#6eb5ff',
	parent_label: '#34d399',
	sublabel_of: '#34d399',
	on_label: '#34d399',
	company_on: '#34d399',
};
