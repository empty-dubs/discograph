export type NodeType = 'artist' | 'label' | 'release' | 'master';

export type EdgeType =
	| 'member_of'
	| 'released'
	| 'on_label'
	| 'company_on'
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
	parent_label?: { id: number; name: string };
	sublabels?: { id: number; name: string }[];
	meta?: {
		year?: number | string;
		role?: string;
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
