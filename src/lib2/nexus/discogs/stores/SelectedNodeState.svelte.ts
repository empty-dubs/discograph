import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument, runPatchLoadAction } from '../load-runner';
import { plugin as source } from '../../../plugins/discogs';

import type { EntityType, LoadType, RelatedEntityType, SearchableListItem } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);

	attributes = $derived.by(() => {
		if (!this.id) return undefined;

		return graph.data.nodes.get(this.id);
	});

	document = $derived.by(() => {
		if (!this.id) return undefined;

		void source.stores.documentStore.documents;

		return source.stores.documentStore.get(this.id);
	});

	entityDocumentStatus = $derived.by(() => {
		if (!this.id) return undefined;

		return source.stores.fetchStatus.get(this.id) ?? 'idle';
	});

	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');

	isLoading = $derived.by(() => {
		if (!this.id) return false;

		void source.stores.loadProgress.documentsInFlight;

		return source.stores.loadProgress.isInFlight(this.id);
	});

	isBlocked = $derived(
		this.attributes
		? source.fetch.isBlocked(this.attributes.type as EntityType, this.attributes.externalId)
		: false
	);

	hasReleaseParentType = $derived(
		this.attributes ? source.releases.isReleaseParentType(this.attributes.type) : false
	);

	hasReleaseData = $derived(this.id ? source.releases.hasReleaseData(this.id) : false);

	hasChildren = $derived.by(() => {
		if (!this.id) return false;

		const childNodes = graph.expansion.parentChildAdjacencyList.get(this.id) ?? new Set();

		return childNodes.size > 0;
	});

	releaseListItems = $derived.by((): SearchableListItem[] => {
		if (!this.id || !this.attributes) return [];

		void source.stores.releasesStore.releases;
		void source.stores.documentStore.documents;

		return source.releases.getReleaseListItems(this.id, this.attributes.type as EntityType);
	});

	relatedEntityGroups = $derived.by((): { id: RelatedEntityType; title: string }[] => {
		if (!this.attributes || !this.document) return [];

		return source.relatedEntities.getRelatedEntityGroups(
			this.document,
			this.attributes.type as EntityType
		);
	});

	neighborTypes = $derived.by((): LoadType[] => {
		if (!this.attributes || this.isBlocked) return [];

		return source.constants.neighborTypes[this.attributes.type as EntityType] ?? [];
	});

	relatedEntityItems(relatedEntityType: RelatedEntityType): SearchableListItem[] {
		if (!this.attributes || !this.document) return [];

		return source.relatedEntities.getRelatedEntityItems(
			this.document,
			this.attributes.type as EntityType,
			relatedEntityType
		);
	}

	isLoadTypeCompleted(loadType: LoadType): boolean {
		if (!this.id || !this.document || !this.attributes) return true;

		const relatedEntities = source.relatedEntities.getRelatedEntities(this.document, this.attributes.type as EntityType, loadType as RelatedEntityType);
		const relatedEntityType = source.constants.relatedEntityTypeMap[loadType];

		if (!relatedEntities || !relatedEntityType) return true;

		const eligibleNeighbors = relatedEntities.filter((entity) => {
			const relatedEntityId = source.compositions.getEntityId(relatedEntityType, entity.id);

			return (
				!graph.expansion.parentChildAdjacencyList.get(this.id!)?.has(relatedEntityId) &&
				!graph.expansion.parentChildAdjacencyList.get(relatedEntityId)?.has(this.id!) &&
				!source.fetch.isBlocked(relatedEntityType as EntityType, entity.id)
			);
		});

		return eligibleNeighbors.length === 0;
	}

	collapseNode() {
		if (!this.id || !this.hasChildren) return;

		const descendants = collectDescendants(this.id, graph.expansion.parentChildAdjacencyList, graph.expansion.childParentAdjacencyList);

		if (descendants.size === 0) return;

		graph.data.removeNodes(descendants);
		graph.data.removeChildLinks(this.id);
		graph.expansion.collapse(this.id, descendants);

		source.stores.releasesStore.delete(descendants);
		source.stores.pagedDocumentStore.delete(descendants);
		source.stores.documentStore.delete(descendants);
		source.stores.fetchStatus.delete(descendants);

		source.stores.pagedDocumentStore.delete(new Set([this.id]));
		source.stores.releasesStore.delete(new Set([this.id]));
	}

	hasMorePages(loadType: LoadType): boolean {
		if (!this.id) return false;

		const document = source.stores.pagedDocumentStore.get(this.id, loadType);

		if (!document) return false;

		return document.pagination ? document.pagination.page < document.pagination.pages : false;
	}

	hasPagedDocument(loadType: LoadType): boolean {
		if (!this.id) return false;

		return source.stores.pagedDocumentStore.has(this.id, loadType);
	}

	async loadEntityDocument() {
		if (!this.attributes) return;

		await loadEntityDocument(this.attributes);
	}

	async runLoadAction(loadType: LoadType) {
		if (!this.attributes) return;

		await runPatchLoadAction(this.attributes, loadType);
	}
}

export default new SelectedNodeState();
