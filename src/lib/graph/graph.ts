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
		const currentNodeIds = new Set(this.data.nodes.keys());

		this.data.applyPatch(patch);

		const newNodeIds = [...this.data.nodes.keys()].filter(
			(id) => id !== parentNodeId && !currentNodeIds.has(id)
		);

		if (newNodeIds.length === 0) return;

		const parentChildMap = new Map(this.visitedNodes.expansionChildren);
		const childNodeIds = new Set(parentChildMap.get(parentNodeId) ?? []);

		for (const id of newNodeIds) {
			childNodeIds.add(id);
		}

		parentChildMap.set(parentNodeId, childNodeIds);
		this.visitedNodes.expansionChildren = parentChildMap;
	}

	clear() {
		this.display.clear();
		this.visitedNodes.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
