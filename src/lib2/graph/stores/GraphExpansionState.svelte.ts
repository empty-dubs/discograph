import { SvelteMap } from 'svelte/reactivity';

class GraphExpansionState {
	parentChildAdjacencyList = $state<SvelteMap<string, Set<string>>>(new SvelteMap());
	childParentAdjacencyList = $state<SvelteMap<string, Set<string>>>(new SvelteMap());

	collapse(nodeId: string, descendantIds: Set<string>) {
		if (!nodeId || descendantIds.size === 0) return;

		for (const id of descendantIds) {
			this.parentChildAdjacencyList.delete(id);
			this.childParentAdjacencyList.delete(id);
		}

		this.parentChildAdjacencyList.delete(nodeId);
	}

	clear() {
		this.parentChildAdjacencyList = new SvelteMap();
		this.childParentAdjacencyList = new SvelteMap();
	}
}

export default new GraphExpansionState();
