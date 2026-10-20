import { graph } from '../../graph/graph';
import { plugin as source } from '../../plugins/discogs';

import { LOAD_ACTION_CONFIG } from './expansion-config';

import type { EntityType, LoadType, Pagination } from '../../plugins/discogs';
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

export async function loadEntityDocument(node: GraphNode): Promise<'loaded' | 'skipped' | 'failed'> {
	if (isBlockedNode(node)) {
		graph.expansion.setPrimaryDocumentStatus(node.id, 'loaded');

		return 'skipped';
	}

	const status = graph.expansion.primaryDocumentByNodeId.get(node.id);

	if (status === 'loading' || status === 'loaded' || status === 'failed') {
		return 'skipped';
	}

	const result = await graph.expansion.withExpansionInFlight(node.id, async () => {
		graph.expansion.setPrimaryDocumentStatus(node.id, 'loading');

		const payload = await withRequest(
			() => source.fetch.fetchEntityDocument(node.externalId, node.type as EntityType),
			source.fetch.entityFetchErrorMessage(node.type as EntityType)
		);

		if (!payload) {
			graph.expansion.setPrimaryDocumentStatus(node.id, 'failed');

			return 'failed';
		}

		graph.expansion.setPrimaryDocumentStatus(node.id, 'loaded');

		const label = displayLabelFromDocument(payload as { title?: string; name?: string });

		if (label) {
			graph.data.updateNode(node.id, { label });
		}

		return 'loaded';
	});

	return result ?? 'skipped';
}

async function ensureEntityDocument(node: GraphNode): Promise<boolean> {
	const status = graph.expansion.primaryDocumentByNodeId.get(node.id);

	if (status === 'loaded') return true;

	const outcome = await loadEntityDocument(node);

	return outcome === 'loaded' || outcome === 'skipped';
}

function getLoadAction(node: GraphNode, loadType: LoadType): LoadAction | undefined {
	return LOAD_ACTION_CONFIG[loadType]?.[node.type as EntityType];
}

async function runDocumentPatchLoadAction(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'document' }>,
	loadType: LoadType
) {
	if (!(await ensureEntityDocument(node))) return;

	const document = source.documentStore.get(node.id);

	if (!document) return;

	const patch = loadAction.patch(document);

	graph.applyPatchFromExpansion(node.id, patch);
	source.loadProgress.markLoadTypeCompleted(node.id, loadAction.markCompleted ?? loadType);
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

	if (!response || typeof response !== 'object' || !('pagination' in response)) return;

	const patch = loadAction.patch(node, response);

	graph.applyPatchFromExpansion(node.id, patch);

	const pagination = response.pagination as Pagination;

	source.loadProgress.setPagedDocument(node.id, loadType, pagination);

	if (pagination.page >= pagination.pages) {
		source.loadProgress.markLoadTypeCompleted(node.id, loadType);
	}
}

// TODO: update this to be more like runDocumentPatchLoadAction
// or roll into runDocumentPatchLoadAction
async function runCustomPatchLoadAction(
	node: GraphNode,
	loadAction: Extract<LoadAction, { source: 'custom' }>,
	loadType: LoadType
) {
	if (!(await ensureEntityDocument(node))) return;

	const ok = await withRequest(async () => {
		await loadAction.run(node);

		return true;
	}, loadActionErrorMessage(loadType));

	if (ok) {
		source.loadProgress.markLoadTypeCompleted(node.id, loadType);
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

	await graph.expansion.withExpansionInFlight(node.id, async () => {
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
			const paging = source.loadProgress.getPagedDocument(node.id, loadAction.expansionId);

			if (!paging || paging.page >= paging.pages) return;

			page = paging.page + 1;
		} else {
			page = options?.page ?? 1;
		}

		await runReleasesPatchLoadAction(node, loadAction, loadType, page);
	});
}
