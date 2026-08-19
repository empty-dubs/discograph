import { SvelteSet } from 'svelte/reactivity';

import { ALL_EDGE_TYPES, ALL_NODE_TYPES } from '../constants';

import { filterVisibleLinks, filterVisibleNodes } from '../operations/filters';
import { graphDataState } from './GraphDataState.svelte';

import type { EdgeType, GraphNode, NodeType } from '../types';

export class GraphDisplayState {
	selectedId = $state<string | null>(null);
	visibleTypes = $state<SvelteSet<NodeType>>(new SvelteSet(ALL_NODE_TYPES));
	viewResetToken = $state(0);
	showNodeLabels = $state(true);
	highlightedEdgeType = $state<EdgeType | null>(null);

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

	get edgeTypeCounts(): Record<EdgeType, number> {
		const counts = Object.fromEntries(ALL_EDGE_TYPES.map((t) => [t, 0])) as Record<EdgeType, number>;

		for (const link of this.visibleLinkList) {
			if (ALL_EDGE_TYPES.includes(link.type)) {
				counts[link.type]++;
			}
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

	selectEdgeType(type: EdgeType) {
		this.highlightedEdgeType = type;
	}

	clearEdgeHighlight() {
		this.highlightedEdgeType = null;
	}

	clear() {
		this.selectedId = null;
		this.visibleTypes = new SvelteSet(ALL_NODE_TYPES);
		this.showNodeLabels = true;
		this.highlightedEdgeType = null;
		this.viewResetToken++;
	}
}

export const graphDisplayState = new GraphDisplayState();
