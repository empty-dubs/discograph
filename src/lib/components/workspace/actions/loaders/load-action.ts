import { discogsApi } from '$lib/discogs/discogs.svelte';
import { LOAD_ACTION_CONFIG } from '$lib/graph/node-load-config';
import { LOAD_ACTION_LABELS, type LoadAction } from '../constants';

import type { Pagination } from '$lib/discogs/types';
import type { GraphInterface } from '$lib/graph/graph';
import type { SelectedNodeInterface } from '$lib/graph/stores/SelectedNodeState.svelte';

interface RunLoadOptions<T> {
	fetch: () => Promise<T>;
	merge: (payload: T) => void | Promise<void>;
	errorMessage: string;
}

async function runLoad<T>(
	graph: Pick<GraphInterface, 'visitedNodes'>,
	node: SelectedNodeInterface,
	{ fetch, merge, errorMessage }: RunLoadOptions<T>
): Promise<void> {
	if (graph.visitedNodes.withLoadingChildren.has(node.id!)) return;

	graph.visitedNodes.withLoadingChildren.add(node.id!);

	await discogsApi.withRequest(async () => {
		const payload = await fetch();

		await merge(payload);
	}, errorMessage);

	graph.visitedNodes.withLoadingChildren.delete(node.id!);
}

type RunLoadActionOptions = {
	page?: number | 'next';
};

function loadErrorMessage(action: LoadAction): string {
	return `Failed to ${LOAD_ACTION_LABELS[action].toLowerCase()}`;
}

export async function runLoadAction(
	graph: GraphInterface,
	node: SelectedNodeInterface,
	action: LoadAction,
	options?: RunLoadActionOptions
): Promise<void> {
	if (!node.data?.discogsId) return;
	if (node.isBlocked) return;

	const entry = LOAD_ACTION_CONFIG[action]?.[node.data?.type!];

	if (!entry) return;

	const ctx = { graph, nodeId: node.id!, discogsId: node.data?.discogsId! };
	const errorMessage = loadErrorMessage(action);

	if (entry.kind === 'custom') {
		await runLoad(graph, node, {
			fetch: () => entry.run(ctx),
			merge: () => {},
			errorMessage
		});
		return;
	}

	if (entry.kind === 'patch') {
		await runLoad(graph, node, {
			fetch: () => entry.fetch(node.data?.discogsId!),
			merge: (payload) => {
				graph.applyPatchFromExpansion(node.id!, entry.toPatch(payload, ctx));
				graph.visitedNodes.markActionLoaded(node.id!, entry.markActionLoaded ?? action);
			},
			errorMessage
		});
		return;
	}

	let page: number;

	if (options?.page === 'next') {
		const paging = entry.getPaging(graph, node.id!);

		if (!paging || paging.page >= paging.pages) return;

		page = paging.page + 1;
	} else {
		page = options?.page ?? 1;
	}

	await runLoad(graph, node, {
		fetch: () => entry.fetchPage(node.data?.discogsId!, page),
		merge: (payload) => {
			graph.applyPatchFromExpansion(node.id!, entry.toPatch(payload, ctx));
			entry.setPaging(
				graph,
				node.id!,
				(payload as { pagination: Pagination }).pagination
			);
		},
		errorMessage
	});
}
