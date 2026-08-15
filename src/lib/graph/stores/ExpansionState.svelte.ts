import {
	collectDescendants,
	findRemovableDescendants,
	hasExpansionChildren
} from '../operations/crawlers';
import { graphDataState } from './GraphDataState.svelte';
import { graphDisplayState } from './DisplayState.svelte';

export interface CollapseSideEffects {
	onNodesRemoved?: (nodeIds: Set<string>) => void;
}

export class ExpansionState {
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	expanded = $state<Set<string>>(new Set());

	collapseNode(nodeId: string, sideEffects: CollapseSideEffects = {}) {
		if (!this.expansionChildren.has(nodeId)) return;

		const descendants = collectDescendants(this.expansionChildren, nodeId);
		const toRemove = findRemovableDescendants(nodeId, descendants, graphDataState.linkList);

		if (toRemove.size === 0) {
			const nextExpanded = new Set(this.expanded);
			nextExpanded.delete(nodeId);
			this.expanded = nextExpanded;
			return;
		}

		graphDataState.removeNodes(toRemove);

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

		if (graphDisplayState.selectedId && toRemove.has(graphDisplayState.selectedId)) {
			graphDisplayState.selectedId = nodeId;
		}

		sideEffects.onNodesRemoved?.(toRemove);
	}

	hasChildren(nodeId: string): boolean {
		return hasExpansionChildren(nodeId, this.expansionChildren, graphDataState.nodes);
	}

	clear() {
		this.expansionChildren = new Map();
		this.expanded = new Set();
	}
}

export const expansionState = new ExpansionState();
