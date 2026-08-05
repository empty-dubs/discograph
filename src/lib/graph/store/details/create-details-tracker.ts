import type { DetailsTracker, DetailsTrackerConfig, DetailsTrackerContext } from '../types';

function setDetailsLoading(ctx: DetailsTrackerContext, id: string, isLoading: boolean) {
	const next = new Set(ctx.getLoading());

	if (isLoading) {
		next.add(id);
	} else {
		next.delete(id);
	}

	ctx.setLoadingSet(next);
}

export function createDetailsTracker<T>(config: DetailsTrackerConfig<T>): DetailsTracker<T> {
	return {
		async ensure(ctx, nodeId) {
			const { type, discogsId } = ctx.parseNodeId(nodeId);

			if (type !== config.nodeType || discogsId === null) return;
			if (ctx.getFetched().has(nodeId) || ctx.getLoading().has(nodeId)) return;

			setDetailsLoading(ctx, nodeId, true);
			ctx.setError(null);

			try {
				const entity = await config.fetch(discogsId);

				ctx.updateRateLimit();
				await config.merge(ctx, nodeId, entity);
				ctx.setFetched(new Set(ctx.getFetched()).add(nodeId));
			} catch (err) {
				ctx.setError(err instanceof Error ? err.message : config.errorMessage);
			} finally {
				setDetailsLoading(ctx, nodeId, false);
			}
		},

		isLoading(ctx, nodeId) {
			return ctx.getLoading().has(nodeId);
		},

		markFetched(ctx, nodeId) {
			ctx.setFetched(new Set(ctx.getFetched()).add(nodeId));
		},

		async merge(ctx, nodeId, entity) {
			await config.merge(ctx, nodeId, entity);
		}
	};
}
