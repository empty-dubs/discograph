import { graph } from '../../graph/graph';

import type { LoadType } from '../../plugins/discogs';

export function markDiscogsExpansionCompleted(nodeId: string, loadType: LoadType) {
	graph.expansion.markExpansionCompleted(nodeId, loadType);
}

export function setDiscogsExpansionPaging(
	nodeId: string,
	loadType: LoadType,
	page: number,
	pages: number,
	items: number
) {
	graph.expansion.setExpansionPaging(nodeId, loadType, page, pages, items);
}
	
export function hasMoreDiscogsExpansionPages(nodeId: string, loadType: LoadType): boolean {
	return graph.expansion.hasMoreExpansionPages(nodeId, loadType);
}

export function isDiscogsExpansionCompleted(nodeId: string, loadType: LoadType): boolean {
	return graph.expansion.isExpansionCompleted(nodeId, loadType);
}

export function hasDiscogsExpansionPaging(nodeId: string, loadType: LoadType): boolean {
	return graph.expansion.hasExpansionPaging(nodeId, loadType);
}
