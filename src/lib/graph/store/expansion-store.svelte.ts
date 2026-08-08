import {
	collectDescendants,
	findRemovableDescendants,
	hasExpansionChildren
} from './expansion';
import { graphDataStore } from './data-store.svelte';
import { graphUiStore } from './ui-store.svelte';

import type { GraphPatch } from '../types';

export interface CollapseSideEffects {
	onNodesRemoved?: (nodeIds: Set<string>) => void;
}

class ExpansionStore {
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	expanded = $state<Set<string>>(new Set());

	applyPatchFromExpansion(parentNodeId: string, patch: GraphPatch) {
		const currentNodeIds = new Set(graphDataStore.nodes.keys());

		graphDataStore.applyPatch(patch);

		const newNodeIds = [...graphDataStore.nodes.keys()].filter(
			(id) => id !== parentNodeId && !currentNodeIds.has(id)
		);

		if (newNodeIds.length === 0) return;

		const parentChildMap = new Map(this.expansionChildren);
		const childNodeIds = new Set(parentChildMap.get(parentNodeId) ?? []);

		for (const id of newNodeIds) {
			childNodeIds.add(id);
		}

		parentChildMap.set(parentNodeId, childNodeIds);
		this.expansionChildren = parentChildMap;
	}

	collapseNode(nodeId: string, sideEffects: CollapseSideEffects = {}) {
		if (!this.expansionChildren.has(nodeId)) return;

		const descendants = collectDescendants(this.expansionChildren, nodeId);
		const toRemove = findRemovableDescendants(nodeId, descendants, graphDataStore.linkList);

		if (toRemove.size === 0) {
			const nextExpanded = new Set(this.expanded);
			nextExpanded.delete(nodeId);
			this.expanded = nextExpanded;
			return;
		}

		graphDataStore.removeNodes(toRemove);

		const nextChildren = new Map(this.expansionChildren);
		for (const id of toRemove) {
			nextChildren.delete(id);
		}
		const parentChildren = new Set(nextChildren.get(nodeId) ?? []);
		for (const id of toRemove) {
			parentChildren.delete(id);
		}
		if (parentChildren.size === 0) {
			nextChildren.delete(nodeId);
		} else {
			nextChildren.set(nodeId, parentChildren);
		}
		this.expansionChildren = nextChildren;

		const nextExpanded = new Set(this.expanded);
		nextExpanded.delete(nodeId);
		for (const id of toRemove) {
			nextExpanded.delete(id);
		}
		this.expanded = nextExpanded;

		if (graphUiStore.selectedId && toRemove.has(graphUiStore.selectedId)) {
			graphUiStore.selectedId = nodeId;
		}
		if (graphUiStore.seedId && toRemove.has(graphUiStore.seedId)) {
			graphUiStore.seedId = nodeId;
		}

		sideEffects.onNodesRemoved?.(toRemove);
	}

	hasChildren(nodeId: string): boolean {
		return hasExpansionChildren(nodeId, this.expansionChildren, graphDataStore.nodes);
	}

	clear() {
		this.expansionChildren = new Map();
		this.expanded = new Set();
	}
}

export const expansionStore = new ExpansionStore();
