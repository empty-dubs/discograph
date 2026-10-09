import { graph } from '../../graph/graph';

import type { LoadAction } from '../../plugins/discogs';

export function markDiscogsExpansionCompleted(nodeId: string, action: LoadAction) {
	graph.expansion.markExpansionCompleted(nodeId, action);
}

export function setDiscogsExpansionPaging(
	nodeId: string,
	action: LoadAction,
	page: number,
	pages: number,
	items: number
) {
	graph.expansion.setExpansionPaging(nodeId, action, page, pages, items);
}
	
export function hasMoreDiscogsExpansionPages(nodeId: string, action: LoadAction): boolean {
	return graph.expansion.hasMoreExpansionPages(nodeId, action);
}

export function isDiscogsExpansionCompleted(nodeId: string, action: LoadAction): boolean {
	return graph.expansion.isExpansionCompleted(nodeId, action);
}

export function hasDiscogsExpansionPaging(nodeId: string, action: LoadAction): boolean {
	return graph.expansion.hasExpansionPaging(nodeId, action);
}
