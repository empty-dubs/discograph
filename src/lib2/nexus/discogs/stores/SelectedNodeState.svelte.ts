import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument } from '../load-runner';
import { discogsPlugin as discogs } from '../../../plugins/discogs';

import type { LoadType, SearchType } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);
	data = $derived(graph.data.nodes.get(this.id!));
	document = $derived(discogs.documentStore.get(this.id!));

	hasChildren = $derived(graph.expansion.parentChildAdjacencyList.has(this.id!));
	entityDocumentStatus = $derived(graph.expansion.primaryDocumentByNodeId.get(this.id!));
	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');
	hasExpansionInFlight = $derived(graph.expansion.expansionInFlightNodeIds.has(this.id!));
	isBlocked = $derived(discogs.isBlocked(this.data!.type as SearchType, this.data!.externalId));

	neighborTypes = $derived.by((): LoadType[] => {
		if (!this.data || this.isBlocked) return [];

		return discogs.constants.neighborTypes[this.data.type as SearchType] ?? [];
	});

	isLoadTypeCompleted(loadType: LoadType): boolean {
		if (!this.id) return false;

		return discogs.loadProgress.isLoadTypeCompleted(this.id, loadType);
	}

	collapseNode() {
		if (!this.id || !this.hasChildren) return;

		const descendants = collectDescendants(this.id, graph.expansion.parentChildAdjacencyList);

		if (descendants.size === 0) return;

		graph.data.removeNodes(descendants);
		graph.expansion.resetForCollapse(new Set([this.id]), descendants);
		discogs.loadProgress.resetForExpandedNodes(new Set([this.id]));
		discogs.documentStore.delete(descendants);
	}

	hasMorePages(loadType: LoadType): boolean {
		if (!this.id) return false;

		return discogs.loadProgress.hasMorePages(this.id, loadType);
	}

	hasPagedDocument(loadType: LoadType): boolean {
		if (!this.id) return false;

		return discogs.loadProgress.hasPagedDocument(this.id, loadType);
	}

	async loadEntityDocument() {
		const node = this.data;

		if (!node) return;

		await loadEntityDocument(node);
	}
}

export default new SelectedNodeState();
