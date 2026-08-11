import { getLabel, getRelease } from '$lib/discogs/client';

import { buildCompaniesFromRelease, buildFromLabel, buildLabelsFromRelease } from '../operations/patches/labels';

import { runLoad } from './run-load';

import type { Graph } from '../store/graph.svelte';

export async function loadRelatedLabels(graph: Graph, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'label': {
				const label = await getLabel(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildFromLabel(label));
				graph.details.markLabelDetailsFetched(nodeId);
				break;
			}
			case 'release': {
				const release = await getRelease(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildLabelsFromRelease(release));
				break;
			}
		}

		graph.progress.markActionLoaded(nodeId, 'labels');
	}, 'Failed to load related labels');
}

export async function loadRelatedCompanies(graph: Graph, nodeId: string) {
	const { type, discogsId } = graph.data.parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'release': {
				const release = await getRelease(discogsId);
				graph.expansion.applyPatchFromExpansion(nodeId, buildCompaniesFromRelease(release));
				break;
			}
		}

		graph.progress.markActionLoaded(nodeId, 'companies');
	}, 'Failed to load related companies');
}
