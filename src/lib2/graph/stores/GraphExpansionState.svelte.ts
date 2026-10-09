import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { ExpansionPaging, PrimaryDocumentStatus } from '../types';

class GraphExpansionState {
	parentChildAdjacencyList = $state<SvelteMap<string, Set<string>>>(new SvelteMap());
	primaryDocumentByNodeId = $state<SvelteMap<string, PrimaryDocumentStatus>>(new SvelteMap());
	completedExpansionsByNodeId = $state<SvelteMap<string, Set<string>>>(new SvelteMap());
	expansionInFlightNodeIds = $state<SvelteSet<string>>(new SvelteSet());
	expansionPagingByNodeId = $state<SvelteMap<string, SvelteMap<string, ExpansionPaging>>>(
		new SvelteMap()
	);

	hasMoreExpansionPages(nodeId: string, expansionId: string): boolean {
		const paging = this.expansionPagingByNodeId.get(nodeId)?.get(expansionId);

		return paging ? paging.page < paging.pages : false;
	}

	markExpansionCompleted(nodeId: string, expansionId: string) {
		const completed = new Set(this.completedExpansionsByNodeId.get(nodeId) ?? []);

		completed.add(expansionId);
		this.completedExpansionsByNodeId.set(nodeId, completed);
	}

	isExpansionCompleted(nodeId: string, expansionId: string): boolean {
		return this.completedExpansionsByNodeId.get(nodeId)?.has(expansionId) ?? false;
	}

	hasExpansionPaging(nodeId: string, expansionId: string): boolean {
		return this.expansionPagingByNodeId.get(nodeId)?.has(expansionId) ?? false;
	}

	setPrimaryDocumentStatus(nodeId: string, status: PrimaryDocumentStatus) {
		this.primaryDocumentByNodeId.set(nodeId, status);
	}

	setExpansionPaging(
		nodeId: string,
		expansionId: string,
		page: number,
		pages: number,
		items: number
	) {
		const nextByNode = new SvelteMap(this.expansionPagingByNodeId.get(nodeId) ?? []);

		nextByNode.set(expansionId, { page, pages, items });
		this.expansionPagingByNodeId.set(nodeId, nextByNode);
	}

	resetForCollapse(expandedNodeIds: Set<string>, removedDescendantIds: Set<string>) {
		if (expandedNodeIds.size === 0 && removedDescendantIds.size === 0) return;

		for (const id of expandedNodeIds) {
			this.parentChildAdjacencyList.delete(id);
			this.completedExpansionsByNodeId.delete(id);
			this.expansionPagingByNodeId.delete(id);
		}

		for (const id of removedDescendantIds) {
			this.primaryDocumentByNodeId.delete(id);
			this.expansionInFlightNodeIds.delete(id);
		}
	}

	clear() {
		this.parentChildAdjacencyList = new SvelteMap();
		this.primaryDocumentByNodeId = new SvelteMap();
		this.completedExpansionsByNodeId = new SvelteMap();
		this.expansionInFlightNodeIds = new SvelteSet();
		this.expansionPagingByNodeId = new SvelteMap();
	}
}

export default new GraphExpansionState();
