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
	ctx.error = null;

	try {
		await fn();
	} catch (err) {
		ctx.error = err instanceof Error ? err.message : errorMessage;
	} finally {
		ctx.setLoading(nodeId, false);
	}
}
