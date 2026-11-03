import { graph } from '../../graph/graph';
import { plugin as source } from '../../plugins/discogs';
import { LOAD_ACTION_CONFIG } from './patch-config';

import type { EntityDocument, EntityType, LoadType } from '../../plugins/discogs';
import type { GraphNode, GraphPatch } from '../../graph/types';
import type { LoadAction } from './patch-config';

function displayLabelFromDocument(document: {
	title?: string;
	name?: string;
}): string | undefined {
	return document.title ?? document.name;
}

export async function loadEntityDocument(node: GraphNode): Promise<void> {
	const payload = await source.fetch.fetchEntityDocument(node.externalId, node.type as EntityType);

	if (!payload) return;

	const label = displayLabelFromDocument(payload);

	if (label) graph.data.updateNode(node.id, { label });
}

function getLoadAction(node: GraphNode, loadType: LoadType): LoadAction | undefined {
	return LOAD_ACTION_CONFIG[loadType]?.[node.type as EntityType];
}

function getDocumentPatch(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'document' }>
) {
	const document = source.stores.documentStore.get(node.id);

	if (!document) return;

	return loadAction.patch(document);

}

async function getReleasesPatch(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'releases' }>,
	loadType: LoadType
) {
	const response = await source.fetch.fetchPagedDocument(node.type as EntityType, node.externalId, loadType);

	if (!response) return;

	return loadAction.patch(node, response);
}

async function getCustomPatch(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'custom' }>,
	loadType: LoadType
) {
	const document = source.stores.documentStore.get(node.id);

	if (!document) return;

	const fetch = loadType === 'main_release'
		? source.fetch.fetchMainReleaseDocument
		: source.fetch.fetchLinkedMasterDocument;

	const response = await fetch(document as EntityDocument);

	if (!response) return;

	return loadAction.patch(node, response);
}

export async function runPatchLoadAction(
	node: GraphNode,
	loadType: LoadType
): Promise<void> {
	const loadAction = getLoadAction(node, loadType);

	if (!loadAction) return;

	if (source.stores.loadProgress.documentsInFlight.has(node.id)) return;

	source.stores.loadProgress.documentsInFlight.add(node.id);

	try {
		let patch: GraphPatch | undefined;

		if (loadAction.source === 'custom') {
			await loadEntityDocument(node);
			patch = await getCustomPatch(node, loadAction, loadType);
		}

		if (loadAction.source === 'document') {
			await loadEntityDocument(node);
			patch = getDocumentPatch(node, loadAction);
		}

		if (loadAction.source === 'releases') {
			patch = await getReleasesPatch(node, loadAction, loadType);
		}

		if (patch) graph.applyPatchFromExpansion(node.id, patch);
	} finally {
		source.stores.loadProgress.documentsInFlight.delete(node.id);
	}
}
