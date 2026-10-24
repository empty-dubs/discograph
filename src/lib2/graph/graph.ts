import GraphDataState from './stores/GraphDataState.svelte';
import GraphExpansionState from './stores/GraphExpansionState.svelte';
import GraphPresentationState from './stores/GraphPresentationState.svelte';

import type { GraphPatch } from './types';

class Graph {
	readonly data = GraphDataState;
	readonly presentation = GraphPresentationState;
	readonly expansion = GraphExpansionState;

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		this.data.applyPatch(patch);

		if (patch.nodes.length === 0 && patch.links.length === 0) return;

		const childNodeIds = new Set(this.expansion.parentChildAdjacencyList.get(parentNodeId) ?? []);

		for (const node of patch.nodes) childNodeIds.add(node.id);

		this.expansion.parentChildAdjacencyList.set(parentNodeId, childNodeIds);
	}

	clear() {
		this.presentation.clear();
		this.expansion.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
