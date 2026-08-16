import { getLabel, getRelease } from '$lib/discogs/client';

import { parseNodeId } from '$lib/graph/operations/transformations';
import { buildCompaniesFromRelease, buildFromLabel, buildLabelsFromRelease } from '$lib/graph/operations/patches/labels';

import { runLoad } from './run-load';

import type { GraphInterface } from '$lib/graph/graph';

export async function loadRelatedLabels(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'label': {
				const label = await getLabel(discogsId);
				graph.applyPatchFromExpansion(nodeId, buildFromLabel(label));
				break;
			}
			case 'release': {
				const release = await getRelease(discogsId);
				graph.applyPatchFromExpansion(nodeId, buildLabelsFromRelease(release));
				break;
			}
		}

		graph.visitedNodes.markActionLoaded(nodeId, 'labels');
	}, 'Failed to load related labels');
}

export async function loadRelatedCompanies(graph: GraphInterface, nodeId: string) {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	await runLoad(graph, nodeId, async () => {
		switch (type) {
			case 'release': {
				const release = await getRelease(discogsId);
				graph.applyPatchFromExpansion(nodeId, buildCompaniesFromRelease(release));
				break;
			}
		}

		graph.visitedNodes.markActionLoaded(nodeId, 'companies');
	}, 'Failed to load related companies');
}
