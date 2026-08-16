import { discogsApi } from '$lib/discogs/discogs.svelte';

import type { GraphInterface } from '$lib/graph/graph';

export async function runLoad(
	graph: GraphInterface,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (graph.visitedNodes.loading.has(nodeId)) return;

	graph.visitedNodes.setLoading(nodeId, true);

	await discogsApi.withRequest(fn, errorMessage);

	graph.visitedNodes.setLoading(nodeId, false);
}
