import { discogsApiStore } from '$lib/discogs/api-store.svelte';

import type { GraphContext } from '../store/graph.svelte';

export async function runLoad(
	ctx: GraphContext,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (ctx.progress.loading.has(nodeId)) return;

	const { discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	ctx.progress.setLoading(nodeId, true);

	await discogsApiStore.withRequest(fn, errorMessage);

	ctx.progress.setLoading(nodeId, false);
}
