export type NodeType = 'artist' | 'label' | 'release' | 'master' | 'track';

export type EdgeType =
	| 'member_of'
	| 'released'
	| 'on_label'
	| 'has_track'
	| 'credited_on'
	| 'version_of'
	| 'sublabel_of';

export interface GraphNode {
	id: string;
	type: NodeType;
	discogsId: number | null;
	name?: string | undefined;
	title?: string | undefined;
	displayName: string;
	uri?: string;
	discogsUrl?: string;
	resource_url?: string;
	// urls?: string[];
	// profile?: string;
	meta?: {
		year?: number | string;
		role?: string;
		position?: string;
		duration?: string;
		genres?: string[];
	};
}

export interface GraphLink {
	id: string;
	source: string;
	target: string;
	type: EdgeType;
	label?: string;
}

export interface GraphPatch {
	nodes: GraphNode[];
	links: GraphLink[];
}
