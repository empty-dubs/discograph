import { SvelteSet } from 'svelte/reactivity';

import GraphDataState from './GraphDataState.svelte';

import type { GraphNode } from '../types';

class GraphPresentationState {
	selectedId = $state<string | null>(null);
	hiddenNodeTypes = $state<SvelteSet<string>>(new SvelteSet());
	showNodeLabels = $state(true);
	showDirectedLinks = $state(true);
	highlightedLinkType = $state<string | null>(null);
	revisionCounter = $state(0);

	get visibleNodes(): GraphNode[] {
		const nodes = GraphDataState.nodeList;
		if (this.hiddenNodeTypes.size === 0) return nodes;
		return nodes.filter(
			(node) =>
				!this.hiddenNodeTypes.has(node.type) || (this.selectedId !== null && node.id === this.selectedId)
		);
	}

	get visibleLinks() {
		const visibleNodeIds = new Set(this.visibleNodes.map((node) => node.id));

		const links = GraphDataState.linkList;

		if (visibleNodeIds.size === 0) return links;

		return links.filter((link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target));
	}

	get nodeTypeCounts(): Record<string, number> {
		const counts: Record<string, number> = {};

		for (const node of GraphDataState.nodeList) {
			counts[node.type] = (counts[node.type] ?? 0) + 1;
		}

		return counts;
	}

	get linkTypeCounts(): Record<string, number> {
		const counts: Record<string, number> = {};

		for (const link of this.visibleLinks) {
			counts[link.type] = (counts[link.type] ?? 0) + 1;
		}

		return counts;
	}

	isNodeTypeVisible(nodeType: string): boolean {
		return !this.hiddenNodeTypes.has(nodeType);
	}

	toggleNodeTypeVisibility(nodeType: string, visible: boolean) {
		const next = new Set(this.hiddenNodeTypes);

		visible ? next.delete(nodeType) : next.add(nodeType);

		this.hiddenNodeTypes = new SvelteSet(next);

		this.revisionCounter++;
	}

	setHighlightedLinkType(linkType: string) {
		this.highlightedLinkType = linkType;
	}

	clearHighlightedLinkType() {
		this.highlightedLinkType = null;
	}

	selectNode(id: string | null) {
		if (this.selectedId === id) return;

		this.selectedId = id;
	}

	clear() {
		this.selectedId = null;
		this.hiddenNodeTypes = new SvelteSet();
		this.showNodeLabels = true;
		this.showDirectedLinks = true;
		this.highlightedLinkType = null;
		this.revisionCounter = 0;
	}
}

export default new GraphPresentationState();
