export interface GraphNode {
	id: string;
	type: string;
	label: string;
}

export interface GraphLink {
	id: string;
	source: string;
	target: string;
	type: string;
	label?: string;
}

export interface GraphPatch {
	nodes: GraphNode[];
	links: GraphLink[];
}
