import { discogsApi } from '$lib/discogs/discogs.svelte';

import { parseNodeId } from '../operations/transformations';

import type { GraphInterface } from '../stores/graph.svelte';

export async function runLoad(
	graph: GraphInterface,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (graph.progress.loading.has(nodeId)) return;

	const { discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	graph.progress.setLoading(nodeId, true);

	await discogsApi.withRequest(fn, errorMessage);

	graph.progress.setLoading(nodeId, false);
}
