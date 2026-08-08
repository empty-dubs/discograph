import { discogsApiStore } from '$lib/discogs/api.svelte';

import type { GraphStoreContext } from './types';

export async function runLoad(
	ctx: GraphStoreContext,
	nodeId: string,
	fn: () => Promise<void>,
	errorMessage: string
): Promise<void> {
	if (ctx.loading.has(nodeId)) return;

	const { discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	ctx.setLoading(nodeId, true);
	discogsApiStore.clearError();

	try {
		await fn();
	} catch (err) {
		discogsApiStore.setError(err instanceof Error ? err.message : errorMessage);
	} finally {
		ctx.setLoading(nodeId, false);
	}
}
