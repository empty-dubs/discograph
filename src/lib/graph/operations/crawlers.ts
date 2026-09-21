import { runLoadAction } from '$lib/components/workspace/actions/loaders/load-action';
import { awaitFetchRequestSlot } from '$lib/discogs/rate-limiter';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

import { fetchNodeDetails } from './fetch-node-details';
import { parseNodeId } from './transformations';
import { getLinkId, getNodeId } from './patches/compositions';

import type { LoadAction } from '$lib/components/workspace/actions/constants';
import type { GraphInterface } from '$lib/graph/graph';
import type { CrawlMode } from '$lib/graph/stores/CrawlState.svelte';
import type { GraphNode, NodeType } from '$lib/graph/types';

type RelatedNeighbors = {
	nodes: string[];
	edges: string[];
};

type QueueItem = {
	nodeId: string;
	depth: number;
};

function getCrawlLoadActions(mode: CrawlMode): LoadAction[] {
	return mode === 'artist-artist' ? ['artists', 'aliases'] : ['labels'];
}

export function getCrawlNodeType(mode: CrawlMode): NodeType {
	return mode === 'artist-artist' ? 'artist' : 'label';
}

export function getRelatedNeighbors(node: GraphNode, action: LoadAction): RelatedNeighbors {
	switch (action) {
		case 'artists':
			if (node.type === 'artist') {
				const nodes = [
					...(node.members ?? []).map((member) => getNodeId('artist', member.id)),
					...(node.groups ?? []).map((group) => getNodeId('artist', group.id))
				];
				const edges = [
					...(node.members ?? []).map((member) =>
						getLinkId(getNodeId(node.type, member.id), 'member_of', node.id)
					),
					...(node.groups ?? []).map((group) =>
						getLinkId(node.id, 'member_of', getNodeId(node.type, group.id))
					)
				];

				return { nodes, edges };
			}

			if (node.type === 'master') {
				const nodes = (node.artists ?? []).map((artist) => getNodeId('artist', artist.id));
				const edges = nodes.map((id) => getLinkId(id, 'released', node.id));

				return { nodes, edges };
			}

			if (node.type === 'release') {
				const nodes = (node.artists ?? []).map((artist) => getNodeId('artist', artist.id));
				const edges = nodes.map((id) => getLinkId(id, 'released', node.id));

				return { nodes, edges };
			}

			return { nodes: [], edges: [] };

		case 'labels':
			if (node.type === 'label') {
				const nodes: string[] = [];
				const edges: string[] = [];

				for (const sublabel of node.sublabels ?? []) {
					const id = getNodeId(node.type, sublabel.id);
					nodes.push(id);
					edges.push(getLinkId(id, 'sublabel_of', node.id));
				}

				if (node.parent_label) {
					const id = getNodeId(node.type, node.parent_label.id);
					nodes.push(id);
					edges.push(getLinkId(node.id, 'sublabel_of', id));
				}

				return { nodes, edges };
			}

			if (node.type === 'release') {
				const nodes = (node.labels ?? []).map((label) => getNodeId('label', label.id));
				const edges = nodes.map((id) => getLinkId(node.id, 'on_label', id));

				return { nodes, edges };
			}

			return { nodes: [], edges: [] };

		case 'aliases': {
			const nodes = (node.aliases ?? []).map((alias) => getNodeId(node.type, alias.id));
			const edges = nodes.map((id) => getLinkId(id, 'alias_of', node.id));

			return { nodes, edges };
		}

		case 'companies': {
			const nodes = (node.companies ?? []).map((company) => getNodeId('label', company.id));
			const edges = nodes.map((id) => getLinkId(id, 'company_on', node.id));

			return { nodes, edges };
		}

		case 'credited_artists': {
			const nodes = (node.credits ?? []).map((credit) => getNodeId('artist', credit.id));
			const edges = nodes.map((id) => getLinkId(id, 'credited_on', node.id));

			return { nodes, edges };
		}

		case 'main_release': {
			if (node.type !== 'master' || !node.main_release_info) {
				return { nodes: [], edges: [] };
			}

			const releaseNodeId = getNodeId('release', node.main_release_info.id);

			return {
				nodes: [releaseNodeId],
				edges: [getLinkId(releaseNodeId, 'version_of', node.id)]
			};
		}

		case 'linked_master': {
			if (node.type !== 'release' || !node.linked_master) {
				return { nodes: [], edges: [] };
			}

			const masterNodeId = getNodeId('master', node.linked_master.id);

			return {
				nodes: [masterNodeId],
				edges: [getLinkId(node.id, 'version_of', masterNodeId)]
			};
		}

		default:
			return { nodes: [], edges: [] };
	}
}

export function getCrawlNeighborIds(node: GraphNode, mode: CrawlMode): string[] {
	if (!node) return [];

	const ids = new Set<string>();

	for (const action of getCrawlLoadActions(mode)) {
		for (const id of getRelatedNeighbors(node, action).nodes) {
			ids.add(id);
		}
	}

	return [...ids];
}


export function collectDescendants(
	rootId: string,
	knownChildren: Map<string, Set<string>>
): Set<string> {
	const descendants = new Set<string>();

	const visit = (id: string) => {
		const children = knownChildren.get(id);

		if (!children) return;

		for (const child of children) {
			if (descendants.has(child)) continue;

			descendants.add(child);

			visit(child);
		}
	};

	visit(rootId);

	return descendants;
}

async function getAssociatedNeighborIds(
	graph: GraphInterface,
	node: GraphNode,
	association: LoadAction
): Promise<string[]> {
	const { nodes, edges } = getRelatedNeighbors(node, association);

	if (edges.length === 0) return nodes;

	if (edges.every((id) => graph.data.links.has(id))) return nodes;

	await runLoadAction(graph, node, association);

	return nodes;
}

async function resolveNeighborIds(
	graph: GraphInterface,
	node: GraphNode,
	mode: CrawlMode
): Promise<string[]> {
	const neighborIds = new Set<string>();

	for (const association of getCrawlLoadActions(mode)) {
		const ids = await getAssociatedNeighborIds(graph, node, association);
		for (const id of ids) neighborIds.add(id);
	}

	return [...neighborIds];
}

function isCrawlableNeighbor(nodeId: string, nodeType: NodeType): boolean {
	const { type, discogsId } = parseNodeId(nodeId);

	if (type !== nodeType || discogsId === null) return false;

	return !discogsApi.isBlockedDiscogsEntity(type, discogsId);
}

export async function runBFSCrawl(
	graph: GraphInterface,
	seedNode: GraphNode,
	mode: CrawlMode,
	maxDepth: number
): Promise<void> {
	const visited = new Set<string>([seedNode.id]);
	const queue: QueueItem[] = [{ nodeId: seedNode.id, depth: 0 }];

	const crawlNodeType = getCrawlNodeType(mode);

	try {
		while (queue.length > 0) {
			if (crawlState.cancelRequested) break;

			const { nodeId, depth } = queue.shift()!;

			if (depth >= maxDepth) continue;

			let node = graph.data.nodes.get(nodeId);

			if (!node) continue;

			const nodeFetchStatus = await fetchNodeDetails(graph, node, {
				beforeFetch: awaitFetchRequestSlot
			});

			if (nodeFetchStatus === 'failed') continue;

			node = graph.data.nodes.get(nodeId) ?? node;

			const neighborIds = await resolveNeighborIds(graph, node, mode);

			for (const neighborId of neighborIds) {
				if (visited.has(neighborId)) continue;
				if (!isCrawlableNeighbor(neighborId, crawlNodeType)) continue;

				visited.add(neighborId);
				queue.push({ nodeId: neighborId, depth: depth + 1 });
			}
		}
	} catch (err) {
		discogsApi.setError(err instanceof Error ? err.message : 'Crawl failed');
	} finally {
		crawlState.finishCrawl();
	}
}
