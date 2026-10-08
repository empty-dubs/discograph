import GraphDataState from './stores/GraphDataState.svelte';
import GraphExpansionState from './stores/GraphExpansionState.svelte';
import GraphPresentationState from './stores/GraphPresentationState.svelte';

import type { GraphPatch } from './types';

class Graph {
	readonly data = GraphDataState;
	readonly presentation = GraphPresentationState;
	readonly expansion = GraphExpansionState;

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		const prePatchNodeIds = new Set(this.data.nodes.keys());

		this.data.applyPatch(patch);

		const postPatchNodeIds = new Set(this.data.nodes.keys());

		const newNodeIds = postPatchNodeIds.difference(prePatchNodeIds);

		if (newNodeIds.size === 0) return;

		const childNodeIds = new Set(this.expansion.parentChildAdjacencyList.get(parentNodeId) ?? []);

		for (const id of newNodeIds) childNodeIds.add(id);

		this.expansion.parentChildAdjacencyList.set(parentNodeId, childNodeIds);
	}

	clear() {
		this.presentation.clear();
		this.expansion.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
