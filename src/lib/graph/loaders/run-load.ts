import { discogsApi } from '$lib/discogs/discogs.svelte';

import { parseNodeId } from '../operations/transformations';

import type { GraphInterface } from '../graph';

export async function runLoad(
	graph: GraphInterface,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (graph.visitedNodes.loading.has(nodeId)) return;

	const { discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	graph.visitedNodes.setLoading(nodeId, true);

	await discogsApi.withRequest(fn, errorMessage);

	graph.visitedNodes.setLoading(nodeId, false);
}
