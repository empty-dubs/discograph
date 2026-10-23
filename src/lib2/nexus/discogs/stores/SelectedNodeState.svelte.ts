import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument, runPatchLoadAction } from '../load-runner';
import { plugin as source } from '../../../plugins/discogs';
import { getReleaseListItems } from '../discover/releases';

import type { LoadActionParams } from '../load-runner';
import type { EntityType, LoadType, RelatedEntityType, SearchableListItem } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);
	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');

	get data() {
		if (!this.id) return undefined;

		return graph.data.nodes.get(this.id);
	}
	
	get document() {
		if (!this.id) return undefined;

		return source.documentStore.get(this.id);
	}

	get entityDocumentStatus() {
		if (!this.id) return undefined;

		return source.loadProgress.getStatus(this.id);
	}

	get isLoading() {
		if (!this.id) return false;

		return source.loadProgress.isInFlight(this.id);
	}

	get isBlocked() {
		if (!this.data) return false;

		return source.isBlocked(this.data.type as EntityType, this.data.externalId);
	}

	get hasReleaseParentType() {
		if (!this.data) return false;

		return source.relatedEntities.isReleaseParentType(this.data.type);
	}

	get hasChildren() {
		if (!this.id) return false;

		return graph.expansion.parentChildAdjacencyList.has(this.id);
	}

	get releaseListItems() {
		if (!this.data) return [];

		return getReleaseListItems(this.data);
	}

	get relatedEntityGroups() {
		if (!this.data || !this.document) return [];

		return source.relatedEntities.getRelatedEntityGroups(this.document, this.data.type as EntityType);
	}

	get neighborTypes() {
		if (!this.data || this.isBlocked) return [];

		return source.constants.neighborTypes[this.data.type as EntityType] ?? [];
	}

	relatedEntityCount(relatedEntityType: RelatedEntityType): number | undefined {
		if (!this.data || !this.document) return undefined;

		return source.relatedEntities.getRelatedEntityCount(this.document, relatedEntityType);
	}

	relatedEntityItems(relatedEntityType: RelatedEntityType): SearchableListItem[] {
		if (!this.data || !this.document) return [];

		return source.relatedEntities.getRelatedEntityItems(
			this.document,
			this.data.type as EntityType,
			relatedEntityType
		);
	}

	isLoadTypeCompleted(loadType: LoadType): boolean {
		if (!this.id) return false;

		return source.loadProgress.isLoadTypeCompleted(this.id, loadType);
	}

	collapseNode() {
		if (!this.id || !this.hasChildren) return;

		const descendants = collectDescendants(this.id, graph.expansion.parentChildAdjacencyList);

		if (descendants.size === 0) return;

		graph.data.removeNodes(descendants);
		graph.expansion.resetForCollapse(new Set([this.id]), descendants);
		source.loadProgress.deleteDocumentStatuses(descendants);
		source.loadProgress.delete(descendants);
		source.loadProgress.resetForExpandedNodes(new Set([this.id]));
		source.documentStore.delete(descendants);
	}

	hasMorePages(loadType: LoadType): boolean {
		if (!this.id) return false;

		return source.loadProgress.hasMorePages(this.id, loadType);
	}

	hasPagedDocument(loadType: LoadType): boolean {
		if (!this.id) return false;

		return source.loadProgress.hasPagedDocument(this.id, loadType);
	}

	async loadEntityDocument() {
		if (!this.data) return;

		await loadEntityDocument(this.data);
	}

	async runLoadAction(loadType: LoadType, options?: LoadActionParams) {
		if (!this.data) return;

		await runPatchLoadAction(this.data, loadType, options);
	}
}

export default new SelectedNodeState();
