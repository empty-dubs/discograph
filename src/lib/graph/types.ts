export type NodeType = 'artist' | 'label' | 'release' | 'master';

export type EdgeType =
	| 'member_of'
	| 'released'
	| 'on_label'
	| 'company_on'
	| 'credited_on'
	| 'version_of'
	| 'sublabel_of'
	| 'alias_of';

export interface GraphNode {
	id: string;
	type: NodeType;
	discogsId: number | null;
	name?: string | undefined;
	title?: string | undefined;
	displayName: string;
	uri?: string;
	resource_url?: string;
	profile?: string;
	realname?: string | null;
	urls?: string[];
	namevariations?: string[];
	groups?: { id: number; name: string }[];
	aliases?: { id: number; name: string }[];
	members?: { id: number; name: string; active?: boolean }[];
	parent_label?: { id: number; name: string };
	sublabels?: { id: number; name: string }[];
	artists?: { id: number; name: string }[];
	tracklist?: { position: string; title: string; duration?: string }[];
	main_release_info?: { id: number; title: string };
	main_release?: number;
	linked_master?: { id: number; title: string };
	notes?: string;
	labels?: { id: number; name: string; catno?: string }[];
	credits?: { id: number; name: string; role?: string }[];
	companies?: { id: number; name: string; entity_type_name?: string }[];
	meta?: {
		year?: number | string;
		role?: string;
		genres?: string[];
		styles?: string[];
		released?: string;
		country?: string;
		format?: string;
	};
}

export interface GraphLink {
	id: string;
	source: number | string;
	target: number | string;
	type: EdgeType;
	label?: string;
}

export interface GraphPatch {
	nodes: GraphNode[];
	links: GraphLink[];
}
