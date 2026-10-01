import { SvelteMap } from 'svelte/reactivity';

import type { GraphLink, GraphNode, GraphPatch } from '../types';

class GraphDataState {
	nodes = $state<SvelteMap<string, GraphNode>>(new SvelteMap());
	links = $state<SvelteMap<string, GraphLink>>(new SvelteMap());
	revisionCounter = $state(0);

	get nodeList(): GraphNode[] {
		return Array.from(this.nodes.values());
	}

	get linkList(): GraphLink[] {
		return Array.from(this.links.values());
	}

	get isEmpty(): boolean {
		return this.nodes.size === 0 && this.links.size === 0;
	}

	applyPatch(patch: GraphPatch) {
		// track the previous size of the nodes and links
		const prevNodeSize = this.nodes.size;
		const prevLinkSize = this.links.size;

		// create a new map for the nodes and links
		const nextNodes = new SvelteMap(this.nodes);
		const nextLinks = new SvelteMap(this.links);

		// apply the patch to the nodes and links
		for (const node of patch.nodes) {
			const existing = nextNodes.get(node.id);

			nextNodes.set(node.id, existing ? { ...existing, ...node } : node);
		}

		for (const link of patch.links) {
			nextLinks.set(link.id, link);
		}

		// update the nodes and links
		this.nodes = nextNodes;
		this.links = nextLinks;

		// increment the revision counter if the size of the nodes or links has changed
		if (nextNodes.size !== prevNodeSize || nextLinks.size !== prevLinkSize) {
			this.revisionCounter++;
		}
	}

	updateNode(nodeId: string, patch: Partial<GraphNode>) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const nextNodes = new SvelteMap(this.nodes);

		nextNodes.set(nodeId, { ...existing, ...patch });
		this.nodes = nextNodes;
	}

	removeNodes(nodeIds: Set<string>) {
		if (nodeIds.size === 0) return;

		const nextNodes = new SvelteMap(this.nodes);
		const nextLinks = new SvelteMap(this.links);

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
		this.revisionCounter++;
	}

	clear() {
		this.nodes = new SvelteMap();
		this.links = new SvelteMap();
		this.revisionCounter++;
	}
}

export default new GraphDataState();
