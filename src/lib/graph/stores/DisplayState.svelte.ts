import { SvelteSet } from 'svelte/reactivity';

import { ALL_NODE_TYPES } from '../constants';

import { filterVisibleLinks, filterVisibleNodes } from '../operations/filters';
import { graphDataState } from './GraphDataState.svelte';

import type { GraphNode, NodeType } from '../types';

export class GraphDisplayState {
	selectedId = $state<string | null>(null);
	visibleTypes = $state<SvelteSet<NodeType>>(new SvelteSet(ALL_NODE_TYPES));
	viewResetToken = $state(0);
	showNodeLabels = $state(true);

	get pinnedIds(): Set<string> {
		const pinned = new Set<string>();

		if (this.selectedId) pinned.add(this.selectedId);

		return pinned;
	}

	get visibleNodeList(): GraphNode[] {
		return filterVisibleNodes(graphDataState.nodeList, this.visibleTypes, this.pinnedIds);
	}

	get visibleLinkList() {
		const visibleNodeIds = new Set(this.visibleNodeList.map((n) => n.id));

		return filterVisibleLinks(graphDataState.linkList, visibleNodeIds);
	}

	get typeCounts(): Record<NodeType, number> {
		const counts = Object.fromEntries(ALL_NODE_TYPES.map((t) => [t, 0])) as Record<NodeType, number>;

		for (const node of graphDataState.nodeList) {
			counts[node.type]++;
		}

		return counts;
	}

	isTypeVisible(type: NodeType): boolean {
		return this.visibleTypes.has(type);
	}

	toggleType(type: NodeType) {
		if (this.visibleTypes.has(type)) {
			if (this.visibleTypes.size === 0) return;

			this.visibleTypes.delete(type);
		} else {
			this.visibleTypes.add(type);
		}
	}

	toggleNodeLabels() {
		this.showNodeLabels = !this.showNodeLabels;
	}

	selectNode(id: string | null) {
		this.selectedId = id;
	}

	clear() {
		this.selectedId = null;
		this.visibleTypes = new SvelteSet(ALL_NODE_TYPES);
		this.showNodeLabels = true;
		this.viewResetToken++;
	}
}

export const graphDisplayState = new GraphDisplayState();
