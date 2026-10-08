import { SvelteSet } from 'svelte/reactivity';

import GraphDataState from './GraphDataState.svelte';

import type { GraphNode } from '../types';

class GraphPresentationState {
	selectedId = $state<string | null>(null);
	visibleTypes = $state<SvelteSet<string>>(new SvelteSet());
	showNodeLabels = $state(true);
	showDirectedEdges = $state(true);
	highlightedEdgeType = $state<string | null>(null);
	revisionCounter = $state(0);

	get visibleNodeList(): GraphNode[] {
		const nodes = GraphDataState.nodeList;

		if (this.visibleTypes.size === 0) return nodes;

		return nodes.filter(
			(node) => this.visibleTypes.has(node.type) || (this.selectedId !== null && node.id === this.selectedId)
		);
	}

	get visibleLinkList() {
		const visibleNodeIds = new Set(this.visibleNodeList.map((node) => node.id));

		const links = GraphDataState.linkList;

		if (visibleNodeIds.size === 0) return links;

		return links.filter((link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target));
	}

	selectNode(id: string | null) {
		if (this.selectedId === id) return;

		this.selectedId = id;
	}

	clear() {
		this.selectedId = null;
		this.visibleTypes = new SvelteSet();
		this.showNodeLabels = true;
		this.showDirectedEdges = true;
		this.highlightedEdgeType = null;
		this.revisionCounter = 0;
	}
}

export default new GraphPresentationState();
