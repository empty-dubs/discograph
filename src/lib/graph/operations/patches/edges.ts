import { getLinkId } from "./compositions";

import type { EdgeType, GraphLink } from "$lib/graph/types";

export function createEdge(sourceNode: string, targetNode: string, edgeType: EdgeType, label?: string): GraphLink {
	return {
		id: getLinkId(sourceNode, edgeType, targetNode),
		source: sourceNode,
		target: targetNode,
		type: edgeType,
		label: label ?? undefined
	};
}
