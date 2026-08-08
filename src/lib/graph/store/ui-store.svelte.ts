import { ALL_NODE_TYPES } from '../constants';

import { filterVisibleLinks, filterVisibleNodes } from './graph-core';
import { graphDataStore } from './data-store.svelte';

import type { GraphNode, NodeType } from '../types';

class GraphUiStore {
	selectedId = $state<string | null>(null);
	seedId = $state<string | null>(null);
	visibleTypes = $state<Set<NodeType>>(new Set(ALL_NODE_TYPES));
	viewResetToken = $state(0);

	get pinnedIds(): Set<string> {
		const pinned = new Set<string>();

		if (this.selectedId) pinned.add(this.selectedId);

		return pinned;
	}

	get visibleNodeList(): GraphNode[] {
		return filterVisibleNodes(graphDataStore.nodeList, this.visibleTypes, this.pinnedIds);
	}

	get visibleLinkList() {
		const visibleNodeIds = new Set(this.visibleNodeList.map((n) => n.id));

		return filterVisibleLinks(graphDataStore.linkList, visibleNodeIds);
	}

	get typeCounts(): Record<NodeType, number> {
		const counts = Object.fromEntries(ALL_NODE_TYPES.map((t) => [t, 0])) as Record<NodeType, number>;

		for (const node of graphDataStore.nodeList) {
			counts[node.type]++;
		}

		return counts;
	}

	get selectedNode(): GraphNode | null {
		return this.selectedId ? (graphDataStore.nodes.get(this.selectedId) ?? null) : null;
	}

	isTypeVisible(type: NodeType): boolean {
		return this.visibleTypes.has(type);
	}

	toggleType(type: NodeType) {
		const visibleTypes = new Set(this.visibleTypes);

		if (visibleTypes.has(type)) {
			if (visibleTypes.size <= 1) return;
			visibleTypes.delete(type);
		} else {
			visibleTypes.add(type);
		}

		this.visibleTypes = visibleTypes;
	}

	selectNode(id: string | null) {
		this.selectedId = id;
	}

	clear() {
		this.seedId = null;
		this.selectedId = null;
		this.visibleTypes = new Set(ALL_NODE_TYPES);
		this.viewResetToken++;
	}
}

export const graphUiStore = new GraphUiStore();
