export interface GraphNode {
	id: string;
	type: string;
	label: string;
	externalId: number;
}

export interface GraphLink {
	id: string;
	parent: string;
	child: string;
	head?: string;
	tail?: string;
	type: string;
	label?: string;
}

export interface GraphPatch {
	nodes: GraphNode[];
	links: GraphLink[];
}
