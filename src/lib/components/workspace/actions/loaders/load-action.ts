import { discogsApi } from '$lib/discogs/discogs.svelte';
import { parseNodeId } from '$lib/graph/operations/transformations';
import { LOAD_ACTION_CONFIG } from '$lib/graph/node-load-config';
import { LOAD_ACTION_LABELS, type LoadAction } from '../constants';

import type { Pagination } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';

interface RunLoadOptions<T> {
	fetch: () => Promise<T>;
	merge: (payload: T) => void | Promise<void>;
	errorMessage: string;
}

async function runLoad<T>(
	graph: GraphInterface,
	nodeId: string,
	{ fetch, merge, errorMessage }: RunLoadOptions<T>
): Promise<void> {
	if (graph.visitedNodes.loading.has(nodeId)) return;

	graph.visitedNodes.setLoading(nodeId, true);

	await discogsApi.withRequest(async () => {
		const payload = await fetch();
		await merge(payload);
	}, errorMessage);

	graph.visitedNodes.setLoading(nodeId, false);
}

export type RunLoadActionOptions = {
	page?: number | 'next';
};

function loadErrorMessage(action: LoadAction): string {
	return `Failed to ${LOAD_ACTION_LABELS[action].toLowerCase()}`;
}

export async function runLoadAction(
	graph: GraphInterface,
	nodeId: string,
	action: LoadAction,
	options?: RunLoadActionOptions
): Promise<void> {
	const { type, discogsId } = parseNodeId(nodeId);

	if (discogsId === null) return;

	const entry = LOAD_ACTION_CONFIG[action]?.[type];

	if (!entry) return;

	const ctx = { graph, nodeId, discogsId };
	const errorMessage = loadErrorMessage(action);

	if (entry.kind === 'custom') {
		await runLoad(graph, nodeId, {
			fetch: () => entry.run(ctx),
			merge: () => {},
			errorMessage
		});
		return;
	}

	if (entry.kind === 'patch') {
		await runLoad(graph, nodeId, {
			fetch: () => entry.fetch(discogsId),
			merge: (payload) => {
				graph.applyPatchFromExpansion(nodeId, entry.toPatch(payload, ctx));
				graph.visitedNodes.markActionLoaded(nodeId, entry.markActionLoaded ?? action);
			},
			errorMessage
		});
		return;
	}

	let page: number;

	if (options?.page === 'next') {
		const paging = entry.getPaging(graph, nodeId);

		if (!paging || paging.page >= paging.pages) return;

		page = paging.page + 1;
	} else {
		page = options?.page ?? 1;
	}

	await runLoad(graph, nodeId, {
		fetch: () => entry.fetchPage(discogsId, page),
		merge: (payload) => {
			graph.applyPatchFromExpansion(nodeId, entry.toPatch(payload, ctx));
			entry.setPaging(
				graph,
				nodeId,
				(payload as { pagination: Pagination }).pagination
			);
		},
		errorMessage
	});
}
