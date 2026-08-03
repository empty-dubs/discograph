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
	profile?: string;
	realname?: string | null;
	urls?: string[];
	namevariations?: string[];
	groups?: { id: number; name: string }[];
	members?: { id: number; name: string; active?: boolean }[];
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
