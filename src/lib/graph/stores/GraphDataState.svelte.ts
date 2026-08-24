import type { GraphLink, GraphNode, GraphPatch } from '../types';

export class GraphDataState {
	nodes = $state<Map<string, GraphNode>>(new Map());
	links = $state<Map<string, GraphLink>>(new Map());

	get nodeList(): GraphNode[] {
		return Array.from(this.nodes.values());
	}

	get linkList(): GraphLink[] {
		return Array.from(this.links.values());
	}

	get isEmpty(): boolean {
		return this.nodes.size === 0 && this.links.size === 0;
	}

	private mergePatch(
		nodes: Map<string, GraphNode>,
		links: Map<string, GraphLink>,
		patch: GraphPatch
	): void {
		for (const node of patch.nodes) {
			const existing = nodes.get(node.id);
	
			if (!existing) {
				nodes.set(node.id, node);
			} else {
				nodes.set(node.id, { ...existing, ...node, meta: { ...existing.meta, ...node.meta } });
			}
		}
	
		for (const link of patch.links) {
			links.set(link.id, link);
		}
	}
	

	applyPatch(patch: GraphPatch) {
		const nextNodes = new Map(this.nodes);
		const nextLinks = new Map(this.links);

		this.mergePatch(nextNodes, nextLinks, patch);

		this.nodes = nextNodes;
		this.links = nextLinks;
	}

	updateNode(nodeId: string, patch: Partial<GraphNode>) {
		const existing = this.nodes.get(nodeId);

		if (!existing) return;

		const nextNodes = new Map(this.nodes);

		nextNodes.set(nodeId, { ...existing, ...patch });

		this.nodes = nextNodes;
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

export const graphDataState = new GraphDataState();
