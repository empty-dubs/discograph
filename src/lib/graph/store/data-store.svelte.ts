import { mergePatch, parseNodeId } from './graph-core';

import type { GraphLink, GraphNode, GraphPatch } from '../types';

class GraphDataStore {
	nodes = $state<Map<string, GraphNode>>(new Map());
	links = $state<Map<string, GraphLink>>(new Map());

	get nodeList(): GraphNode[] {
		return Array.from(this.nodes.values());
	}

	get linkList(): GraphLink[] {
		return Array.from(this.links.values());
	}

	parseNodeId(id: string) {
		return parseNodeId(id);
	}

	applyPatch(patch: GraphPatch) {
		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		mergePatch(nextNodes, nextLinks, patch);

		this.nodes = nextNodes;
		this.links = nextLinks;
	}

	removeNodes(nodeIds: Set<string>) {
		if (nodeIds.size === 0) return;

		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		for (const id of nodeIds) {
			nextNodes.delete(id);
		}

		for (const [linkId, link] of nextLinks) {
			if (nodeIds.has(link.source) || nodeIds.has(link.target)) {
				nextLinks.delete(linkId);
			}
		}

		this.nodes = nextNodes;
		this.links = nextLinks;
	}

	clear() {
		this.nodes = new Map();
		this.links = new Map();
	}
}

export const graphDataStore = new GraphDataStore();
