import GraphDataState from './stores/GraphDataState.svelte';
import GraphExpansionState from './stores/GraphExpansionState.svelte';
import GraphPresentationState from './stores/GraphPresentationState.svelte';

import type { GraphPatch } from './types';

class Graph {
	readonly data = GraphDataState;
	readonly presentation = GraphPresentationState;
	readonly expansion = GraphExpansionState;

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		if (patch.nodes.length === 0 && patch.links.length === 0) return;

		const prePatchLinkIds = new Set(this.data.links.keys());
		
		this.data.applyPatch(patch);

		const postPatchLinkIds = new Set(this.data.links.keys());

		const newLinkIds = postPatchLinkIds.difference(prePatchLinkIds);

		const parentChildAdjacencyList = new Set(this.expansion.parentChildAdjacencyList.get(parentNodeId) ?? []);

		for (const linkId of newLinkIds) {
			const link = this.data.links.get(linkId);

			if (!link) continue;

			const childParentAdjacencyList = new Set(this.expansion.childParentAdjacencyList.get(link.child) ?? []);

			childParentAdjacencyList.add(link.parent);
			parentChildAdjacencyList.add(link.child);

			this.expansion.childParentAdjacencyList.set(link.child, childParentAdjacencyList);
		}

		this.expansion.parentChildAdjacencyList.set(parentNodeId, parentChildAdjacencyList);
	}

	clear() {
		this.presentation.clear();
		this.expansion.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
