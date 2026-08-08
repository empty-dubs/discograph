import * as discogs from '$lib/discogs/client';

import { buildCompaniesFromRelease, buildFromLabel, buildLabelsFromRelease } from '$lib/graph/builder';

import { runLoad } from '../run-load';

import type { GraphStoreContext } from '../types';

export async function loadRelatedLabels(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'label': {
					const label = await discogs.getLabel(discogsId);
					ctx.applyPatchFromExpansion(nodeId, buildFromLabel(label));
					ctx.markLabelDetailsFetched(nodeId);
					break;
				}
				case 'release': {
					const release = await discogs.getRelease(discogsId);
					ctx.applyPatchFromExpansion(nodeId, buildLabelsFromRelease(release));
					break;
				}
			}
		},
		'Failed to load related labels'
	);
}

export async function loadRelatedCompanies(ctx: GraphStoreContext, nodeId: string) {
	const { type, discogsId } = ctx.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(
		ctx,
		nodeId,
		async () => {
			switch (type) {
				case 'release': {
					const release = await discogs.getRelease(discogsId);
					ctx.applyPatchFromExpansion(nodeId, buildCompaniesFromRelease(release));
					break;
				}
			}
		},
		'Failed to load related companies'
	);
}
