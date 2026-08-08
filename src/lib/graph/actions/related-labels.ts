import { getLabel, getRelease } from '$lib/discogs/client';

import { buildCompaniesFromRelease, buildFromLabel, buildLabelsFromRelease } from '$lib/graph/builder';

import { runLoad } from './run-load';

import type { GraphContext } from '../store/context';

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
				break;
			}
		}
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
	}, 'Failed to load related companies');
}
