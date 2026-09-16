import { discogsApi } from '$lib/discogs/discogs.svelte';
import { DETAIL_CONFIG } from '$lib/graph/node-load-config';

import type { GraphInterface } from '$lib/graph/graph';
import type { GraphNode } from '$lib/graph/types';

type FetchNodeDetailsResult = 'fetched' | 'skipped' | 'failed';

export function shouldFetchNodeDetails(graph: GraphInterface, nodeId: string): boolean {
	const status = graph.visitedNodes.status.get(nodeId);

	return status !== 'fetched' && status !== 'loading' && status !== 'failed';
}

export async function fetchNodeDetails(
	graph: GraphInterface,
	node: GraphNode,
	options?: { beforeFetch?: () => Promise<void> }
): Promise<FetchNodeDetailsResult> {
	if (!node.discogsId) return 'skipped';

	const status = graph.visitedNodes.status.get(node.id);

	if (status === 'fetched' || status === 'loading' || status === 'failed') {
		return 'skipped';
	}

	if (discogsApi.isBlockedDiscogsEntity(node.type, node.discogsId)) {
		graph.visitedNodes.setDetailStatus(node.id, 'fetched');
		return 'skipped';
	}

	const config = DETAIL_CONFIG[node.type];

	if (!config) return 'skipped';

	graph.visitedNodes.setDetailStatus(node.id, 'loading');

	await options?.beforeFetch?.();

	const payload = await discogsApi.withRequest(
		() => config.fetch(node.discogsId!),
		config.errorMessage
	);

	if (!payload) {
		graph.visitedNodes.setDetailStatus(node.id, 'failed');
		return 'failed';
	}

	await config.merge(node, graph, payload);

	graph.visitedNodes.setDetailStatus(node.id, 'fetched');

	return 'fetched';
}
