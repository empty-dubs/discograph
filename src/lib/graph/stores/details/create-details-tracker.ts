import { parseNodeId } from '../../operations/transformations';

import { discogsApi } from '$lib/discogs/discogs.svelte';

import type { DetailsTracker, DetailsTrackerConfig, DetailsTrackerContext } from '../types';

export function createDetailsTracker<T>(config: DetailsTrackerConfig<T>): DetailsTracker<T> {
	return {
		async getDetails(ctx: DetailsTrackerContext, nodeId: string) {
			const { type, discogsId } = parseNodeId(nodeId);

			if (type !== config.nodeType || discogsId === null) return;

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
		async merge(ctx: DetailsTrackerContext, nodeId: string, entity: T) {
			await config.merge(ctx, nodeId, entity);
		}
	};
}
