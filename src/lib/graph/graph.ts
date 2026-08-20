import { graphDataState, type GraphDataState } from './stores/GraphDataState.svelte';
import { visitedNodesState, type VisitedNodesState } from './stores/VisitedNodesState.svelte';
import { graphDisplayState, type GraphDisplayState } from './stores/DisplayState.svelte';
import type { GraphPatch } from './types';

export interface GraphInterface {
	readonly data: GraphDataState;
	readonly display: GraphDisplayState;
	readonly visitedNodes: VisitedNodesState;
	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch): void;
	clear(): void;
}

class Graph implements GraphInterface {
	readonly data = graphDataState;
	readonly display = graphDisplayState;
	readonly visitedNodes = visitedNodesState;

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		const prePatchNodeIds = new Set(this.data.nodes.keys());

		this.data.applyPatch(patch);

		const postPatchNodeIds = new Set(this.data.nodes.keys());

		const newNodeIds = postPatchNodeIds.difference(prePatchNodeIds)

		if (newNodeIds.size === 0) return;

		const childNodeIds = new Set(this.visitedNodes.knownChildren.get(parentNodeId) ?? []);

		for (const id of newNodeIds) childNodeIds.add(id);

		this.visitedNodes.knownChildren.set(parentNodeId, childNodeIds);
	}

	clear() {
		this.display.clear();
		this.visitedNodes.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
