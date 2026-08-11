import { discogsApi } from '$lib/discogs/discogs.svelte';

import type { DetailsTracker, DetailsTrackerConfig, DetailsTrackerContext } from '../types';

export function createDetailsTracker<T>(config: DetailsTrackerConfig<T>): DetailsTracker<T> {
	return {
		async ensure(ctx, nodeId) {
			const { type, discogsId } = ctx.parseNodeId(nodeId);

			if (type !== config.nodeType || discogsId === null) return;
			if (ctx.isFetched(nodeId) || ctx.isLoading(nodeId)) return;

			ctx.setStatus(nodeId, 'loading');

			const entity = await discogsApi.withRequest(
				() => config.fetch(discogsId),
				config.errorMessage
			);

			if (!entity) {
				ctx.setStatus(nodeId, 'idle');
				return;
			}

			await config.merge(ctx, nodeId, entity);
			ctx.setStatus(nodeId, 'fetched');
		},

		isLoading(ctx, nodeId) {
			return ctx.isLoading(nodeId);
		},

		markFetched(ctx, nodeId) {
			ctx.setStatus(nodeId, 'fetched');
		},

		async merge(ctx, nodeId, entity) {
			await config.merge(ctx, nodeId, entity);
		}
	};
}
