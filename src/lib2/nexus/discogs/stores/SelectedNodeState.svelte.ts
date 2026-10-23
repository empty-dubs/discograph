import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument, runPatchLoadAction } from '../load-runner';
import { plugin as source } from '../../../plugins/discogs';
import { getReleaseListItems } from '../discover/releases';

import type { LoadActionParams } from '../load-runner';
import type { EntityType, LoadType, RelatedEntityType, SearchableListItem } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);

	data = $derived.by(() => {
		if (!this.id) return undefined;

		void graph.data.nodes;

		return graph.data.nodes.get(this.id);
	});

	document = $derived.by(() => {
		if (!this.id) return undefined;

		void source.documentStore.documents;

		return source.documentStore.get(this.id);
	});

	entityDocumentStatus = $derived.by(() => {
		if (!this.id) return undefined;

		void source.loadProgress.documentStatuses;

		return source.loadProgress.getStatus(this.id);
	});

	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');

	isLoading = $derived.by(() => {
		if (!this.id) return false;

		void source.loadProgress.documentsInFlight;

		return source.loadProgress.isInFlight(this.id);
	});

	isBlocked = $derived(
		this.data
			? source.isBlocked(this.data.type as EntityType, this.data.externalId)
			: false
	);

	hasReleaseParentType = $derived(
		this.data ? source.relatedEntities.isReleaseParentType(this.data.type) : false
	);

	hasReleaseListing = $derived(this.id ? source.relatedEntities.hasReleaseData(this.id) : false);

	hasChildren = $derived.by(() => {
		if (!this.id) return false;

		void graph.expansion.parentChildAdjacencyList;

		return graph.expansion.parentChildAdjacencyList.has(this.id);
	});

	releaseListItems = $derived.by((): SearchableListItem[] => {
		if (!this.data) return [];

		void source.loadProgress.pagination;
		void graph.expansion.parentChildAdjacencyList;
		void source.documentStore.documents;

		return getReleaseListItems(this.data);
	});

	relatedEntityGroups = $derived.by((): { id: RelatedEntityType; title: string }[] => {
		if (!this.data || !this.document) return [];

		return source.relatedEntities.getRelatedEntityGroups(
			this.document,
			this.data.type as EntityType
		);
	});

	neighborTypes = $derived.by((): LoadType[] => {
		if (!this.data || this.isBlocked) return [];

		return source.constants.neighborTypes[this.data.type as EntityType] ?? [];
	});

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
