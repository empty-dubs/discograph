import { graph } from '../../graph/graph';
import { plugin as source } from '../../plugins/discogs';
import { LOAD_ACTION_CONFIG } from './expansion-config';
import { patchState } from './stores/patch-state.svelte';

import type { EntityType, LoadType, PagedDocument } from '../../plugins/discogs';
import type { GraphNode } from '../../graph/types';
import type { LoadAction } from './expansion-config';

// TODO: move request stuff to a more global location
let requestError: string | null = null;

export function getRequestError(): string | null {
	return requestError;
}

function clearRequestError() {
	requestError = null;
}

function setRequestError(message: string | null) {
	requestError = message;
}

export async function withRequest<T>(
	fn: () => Promise<T>,
	errorMessage: string
): Promise<T | null> {
	clearRequestError();

	try {
		return await fn();
	} catch (err) {
		setRequestError(err instanceof Error ? err.message : errorMessage);

		return null;
	}
}

function loadActionErrorMessage(loadType: LoadType): string {
	return `Failed to ${source.constants.loadTypeLabels[loadType].toLowerCase()}`;
}

function isBlockedNode(node: GraphNode): boolean {
	return source.isBlocked(node.type as EntityType, node.externalId);
}

function displayLabelFromDocument(document: {
	title?: string;
	name?: string;
}): string | undefined {
	return document.title ?? document.name;
}

export async function loadEntityDocument(node: GraphNode): Promise<void> {
	if (isBlockedNode(node)) {
		source.stores.fetchState.set(node.id, 'loaded');

		return;
	}

	const status = source.stores.fetchState.get(node.id);

	if (status === 'loading' || status === 'loaded' || status === 'failed') return;

	source.stores.fetchState.set(node.id, 'loading');

	const payload = await withRequest(
		() => source.fetch.fetchEntityDocument(node.externalId, node.type as EntityType),
		source.fetch.entityFetchErrorMessage(node.type as EntityType)
	);

	if (!payload) {
		source.stores.fetchState.set(node.id, 'failed');

		return;
	}

	source.stores.fetchState.set(node.id, 'loaded');

	const label = displayLabelFromDocument(payload as { title?: string; name?: string });

	if (label) graph.data.updateNode(node.id, { label });
}

function getLoadAction(node: GraphNode, loadType: LoadType): LoadAction | undefined {
	return LOAD_ACTION_CONFIG[loadType]?.[node.type as EntityType];
}

async function runDocumentPatchLoadAction(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'document' }>,
	loadType: LoadType
) {
	const document = source.stores.documentStore.get(node.id);

	if (!document) return;

	const patch = loadAction.patch(document);

	graph.applyPatchFromExpansion(node.id, patch);

	for (const _ of patch.nodes) patchState.update(node.id, loadType);
}

async function runReleasesPatchLoadAction(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'releases' }>,
	loadType: LoadType,
	page: number
) {
	const response = await withRequest(
		() => loadAction.fetch(node.externalId, page),
		loadActionErrorMessage(loadType)
	);

	if (!response) return;

	const document = response as PagedDocument;

	source.stores.pagedDocumentStore.set(node.id, document, loadType);
	source.stores.releasesStore.set(node.id, document, loadType, node.type as EntityType);

	const patch = loadAction.patch(node, response);

	graph.applyPatchFromExpansion(node.id, patch);

	for (const _ of patch.nodes) patchState.update(node.id, loadType);
}

// TODO: update this to be more like runDocumentPatchLoadAction
// or roll into runDocumentPatchLoadAction
async function runCustomPatchLoadAction(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'custom' }>,
	loadType: LoadType
) {
	const response = await withRequest(async () => {
		return await loadAction.fetch(node);
	}, loadActionErrorMessage(loadType));

	if (!response) return;

	const patch = loadAction.patch(node, response);

	graph.applyPatchFromExpansion(node.id, patch);

	for (const _ of patch.nodes) {
		patchState.update(node.id, loadType);
	}
}

export type LoadActionParams = {
	page?: number | 'next';
};

export async function runPatchLoadAction(
	node: GraphNode,
	loadType: LoadType,
	options?: LoadActionParams
): Promise<void> {
	if (isBlockedNode(node)) return;

	const loadAction = getLoadAction(node, loadType);

	if (!loadAction) return;

	await source.stores.loadProgress.withInFlight(node.id, async () => {
		if (loadAction.source === 'custom') {
			await runCustomPatchLoadAction(node, loadAction, loadType);

			return;
		}

		if (loadAction.source === 'document') {
			await runDocumentPatchLoadAction(node, loadAction, loadType);

			return;
		}

		let page: number;

		if (options?.page === 'next') {
			const document = source.stores.pagedDocumentStore.get(node.id, loadAction.expansionId);

			if (!document || document.pagination.page >= document.pagination.pages) return;

			page = document.pagination.page + 1;
		} else {
			page = options?.page ?? 1;
		}

		await runReleasesPatchLoadAction(node, loadAction, loadType, page);
	});
}
