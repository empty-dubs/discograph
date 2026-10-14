import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { PrimaryDocumentStatus } from '../types';

class GraphExpansionState {
	parentChildAdjacencyList = $state<SvelteMap<string, Set<string>>>(new SvelteMap());
	primaryDocumentByNodeId = $state<SvelteMap<string, PrimaryDocumentStatus>>(new SvelteMap());
	expansionInFlightNodeIds = $state<SvelteSet<string>>(new SvelteSet());

	async withExpansionInFlight<T>(nodeId: string, fn: () => Promise<T>): Promise<T | null> {
		if (this.expansionInFlightNodeIds.has(nodeId)) return null;

		this.expansionInFlightNodeIds.add(nodeId);

		try {
			return await fn();
		} finally {
			this.expansionInFlightNodeIds.delete(nodeId);
		}
	}

	setPrimaryDocumentStatus(nodeId: string, status: PrimaryDocumentStatus) {
		this.primaryDocumentByNodeId.set(nodeId, status);
	}

	resetForCollapse(expandedNodeIds: Set<string>, removedDescendantIds: Set<string>) {
		if (expandedNodeIds.size === 0 && removedDescendantIds.size === 0) return;

		for (const id of expandedNodeIds) {
			this.parentChildAdjacencyList.delete(id);
		}

		for (const id of removedDescendantIds) {
			this.primaryDocumentByNodeId.delete(id);
			this.expansionInFlightNodeIds.delete(id);
		}
	}

	clear() {
		this.parentChildAdjacencyList = new SvelteMap();
		this.primaryDocumentByNodeId = new SvelteMap();
		this.expansionInFlightNodeIds = new SvelteSet();
	}
}

export default new GraphExpansionState();
