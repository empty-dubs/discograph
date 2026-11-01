import { graph } from '../../graph/graph';
import { plugin as source } from '../../plugins/discogs';
import { LOAD_ACTION_CONFIG } from './expansion-config';
import { patchState } from './stores/patch-state.svelte';

import type { EntityType, LoadType, PagedDocument } from '../../plugins/discogs';
import type { GraphNode } from '../../graph/types';
import type { LoadAction } from './expansion-config';

function loadActionErrorMessage(loadType: LoadType): string {
	return `Failed to ${source.constants.loadTypeLabels[loadType].toLowerCase()}`;
}

function displayLabelFromDocument(document: {
	title?: string;
	name?: string;
}): string | undefined {
	return document.title ?? document.name;
}

export async function loadEntityDocument(node: GraphNode): Promise<void> {
	const payload = await source.fetch.withFetch(
		() => source.fetch.fetchEntityDocument(node.externalId, node.type as EntityType),
		source.fetch.entityFetchErrorMessage(node.type as EntityType)
	);

	if (!payload) return;

	const label = displayLabelFromDocument(payload);

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
	const response = await source.fetch.withFetch(
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
	const response = await source.fetch.withFetch(async () => {
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
	if (source.isBlocked(node.type as EntityType, node.externalId)) return;

	const loadAction = getLoadAction(node, loadType);

	if (!loadAction) return;

	await source.stores.loadProgress.withInFlight(node.id, async () => {
		if (loadAction.source === 'custom') {
			await runCustomPatchLoadAction(node, loadAction, loadType);

			return;
		}

		if (loadAction.source === 'document') {
			await loadEntityDocument(node);
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
