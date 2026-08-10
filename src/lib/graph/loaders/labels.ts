import { getLabel, getRelease } from '$lib/discogs/client';

import { buildCompaniesFromRelease, buildFromLabel, buildLabelsFromRelease } from '../operations/patches/labels';

import { runLoad } from './run-load';

import type { GraphContext } from '../store/graph.svelte';

export async function loadRelatedLabels(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'label': {
				const label = await getLabel(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildFromLabel(label));
				ctx.details.markLabelDetailsFetched(nodeId);
				break;
			}
			case 'release': {
				const release = await getRelease(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildLabelsFromRelease(release));
				// ctx.progress.markActionLoaded(nodeId, 'labels');
				break;
			}
		}

		ctx.progress.markActionLoaded(nodeId, 'labels');
	}, 'Failed to load related labels');
}

export async function loadRelatedCompanies(ctx: GraphContext, nodeId: string) {
	const { type, discogsId } = ctx.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(ctx, nodeId, async () => {
		switch (type) {
			case 'release': {
				const release = await getRelease(discogsId);
				ctx.expansion.applyPatchFromExpansion(nodeId, buildCompaniesFromRelease(release));
				break;
			}
		}

		ctx.progress.markActionLoaded(nodeId, 'companies');
	}, 'Failed to load related companies');
}
