import { graph } from '../../../graph/graph';
import { collectDescendants } from '../../../graph/operations/crawl';
import { loadEntityDocument } from '../load-runner';
import { discogsPlugin as discogs } from '../../../plugins/discogs';
import {
	hasMoreDiscogsExpansionPages,
	isDiscogsExpansionCompleted
} from '../expansion-session';

import type { LoadType, SearchType } from '../../../plugins/discogs';

class SelectedNodeState {
	id = $derived(graph.presentation.selectedId);
	data = $derived(graph.data.nodes.get(this.id!));

	hasChildren = $derived(graph.expansion.parentChildAdjacencyList.has(this.id!));
	hasMoreReleases = $derived(hasMoreDiscogsExpansionPages(this.id!, 'releases'));
	hasMoreMasterReleases = $derived(hasMoreDiscogsExpansionPages(this.id!, 'master_releases'));
	entityDocumentStatus = $derived(graph.expansion.primaryDocumentByNodeId.get(this.id!));
	isEntityDocumentLoading = $derived(this.entityDocumentStatus === 'loading');
	isEntityDocumentLoaded = $derived(this.entityDocumentStatus === 'loaded');
	isEntityDocumentFailed = $derived(this.entityDocumentStatus === 'failed');
	hasExpansionInFlight = $derived(graph.expansion.expansionInFlightNodeIds.has(this.id!));
	isBlocked = $derived(discogs.isBlocked(this.data!.type as SearchType, this.data!.externalId));

	visibleLoadTypes = $derived.by((): LoadType[] => {
		if (!this.data || this.isBlocked) return [];

		return discogs.constants.loadTypes[this.data.type as SearchType] ?? [];
	});

	isExpansionCompleted(loadType: LoadType): boolean {
		if (!this.id) return false;

		return isDiscogsExpansionCompleted(this.id, loadType);
	}

	collapseNode() {
		if (!this.id || !this.hasChildren) return;

		const descendants = collectDescendants(this.id!, graph.expansion.parentChildAdjacencyList);

		if (descendants.size === 0) return;

		graph.data.removeNodes(descendants);
		graph.expansion.resetForCollapse(new Set([this.id]), descendants);
		discogs.documentStore.delete(descendants);
	}

	async loadEntityDocument() {
		const node = this.data;

		if (!node) return;

		await loadEntityDocument(node);
	}
}

export default new SelectedNodeState();
