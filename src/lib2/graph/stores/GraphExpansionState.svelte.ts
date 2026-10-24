import { SvelteMap } from 'svelte/reactivity';

class GraphExpansionState {
	parentChildAdjacencyList = $state<SvelteMap<string, Set<string>>>(new SvelteMap());

	resetForCollapse(expandedNodeIds: Set<string>, _removedDescendantIds: Set<string>) {
		if (expandedNodeIds.size === 0) return;

		for (const id of expandedNodeIds) {
			this.parentChildAdjacencyList.delete(id);
		}
	}

	clear() {
		this.parentChildAdjacencyList = new SvelteMap();
	}
}

export default new GraphExpansionState();
