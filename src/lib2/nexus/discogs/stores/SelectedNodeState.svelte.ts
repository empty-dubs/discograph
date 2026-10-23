import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument } from '../load-runner';
import { plugin as source } from '../../../plugins/discogs';
import { getReleaseListItems } from '../discover/releases';

import type { EntityType, LoadType, RelatedEntityType, SearchableListItem } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);
	data = $derived(graph.data.nodes.get(this.id!));
	document = $derived(source.documentStore.get(this.id!));

	entityDocumentStatus = $derived(source.loadProgress.getStatus(this.id!));
	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');
	isLoading = $derived(source.loadProgress.isInFlight(this.id!));
	isBlocked = $derived(source.isBlocked(this.data!.type as EntityType, this.data!.externalId));
	hasReleaseParentType = $derived(source.relatedEntities.isReleaseParentType(this.data!.type));
	hasChildren = $derived(graph.expansion.parentChildAdjacencyList.has(this.id!));
	releaseListItems = $derived(getReleaseListItems(this.data!));

	get relatedEntityGroups(): { id: RelatedEntityType; title: string }[] {
		if (!this.data || !this.document) return [];

		return source.relatedEntities.getRelatedEntityGroups(this.document, this.data.type as EntityType);
	}

	relatedEntityCount(relatedEntityType: RelatedEntityType): number | undefined {
		if (!this.data || !this.document) return 0;

		return source.relatedEntities.getRelatedEntityCount(this.document, relatedEntityType);
	}

	relatedEntityItems(relatedEntityType: RelatedEntityType): SearchableListItem[] {
		if (!this.data || !this.document) return [];

		return source.relatedEntities.getRelatedEntityItems(this.document, this.data.type as EntityType, relatedEntityType);
	}

	neighborTypes = $derived.by((): LoadType[] => {
		if (!this.data || this.isBlocked) return [];

		return source.constants.neighborTypes[this.data.type as EntityType] ?? [];
	});

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
		const node = this.data;

		if (!node) return;

		await loadEntityDocument(node);
	}
}

export default new SelectedNodeState();
