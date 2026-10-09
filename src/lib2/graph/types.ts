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

export type PrimaryDocumentStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export type ExpansionPaging = {
	page: number;
	pages: number;
	items: number;
};
