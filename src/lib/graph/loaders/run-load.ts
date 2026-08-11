import { discogsApiStore } from '$lib/discogs/api-store.svelte';

import type { Graph } from '../store/graph.svelte';

export async function runLoad(
	graph: Graph,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (graph.progress.loading.has(nodeId)) return;

	const { discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	graph.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(fn, errorMessage);

	graph.progress.setLoading(nodeId, false);
}
