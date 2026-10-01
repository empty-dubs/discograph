// specification for d3 force graph node presentation
export interface NodePresentation {
	color: string;
	radius: number;
}

// type function to look up d3 force graph node presentation
// this is used to lookup the presentation for a given node type
// necessary due to the fact that the graph may contain nodes of multiple types
export type NodePresentationLookup = (type: string) => NodePresentation;

// default node presentation
export const defaultNodePresentation: NodePresentation = { color: '#888888', radius: 10 };
