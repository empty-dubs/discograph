import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { DETAIL_CONFIG } from '$lib/graph/node-load-config';
import { parseNodeId } from '$lib/graph/operations/transformations';
import { collectDescendants } from '../operations/crawlers';

import type { GraphNode, NodeType } from '../types';

export interface SelectedNodeInterface {
	id: string | null;
	data?: GraphNode;
	hasChildren: boolean;
	hasMoreReleases: boolean;
	hasMoreMasterReleases: boolean;
	isDetailsLoading: boolean;
	isDetailsFetched: boolean;
	isDetailsFailed: boolean;
	hasLoadingChildren: boolean;
	isBlocked: boolean;
	releaseTotal: number | null;
	visibleLoadActions: string[];
	collapseNode: () => void;
	fetchNodeDetails: () => Promise<void>;
}

class SelectedNodeState implements SelectedNodeInterface {
	id = $derived(graph.display.selectedId);
    data = $derived(graph.data.nodes.get(this.id!));

	hasChildren = $derived(graph.visitedNodes.knownChildren.has(this.id!));
	hasMoreReleases = $derived(graph.visitedNodes.hasMoreReleases(this.id!));
	hasMoreMasterReleases = $derived(graph.visitedNodes.hasMoreMasterReleases(this.id!));
	isDetailsLoading = $derived(graph.visitedNodes.status.get(this.id!) === 'loading');
	isDetailsFetched = $derived(graph.visitedNodes.status.get(this.id!) === 'fetched');
	isDetailsFailed = $derived(graph.visitedNodes.status.get(this.id!) === 'failed');
	hasLoadingChildren = $derived(graph.visitedNodes.withLoadingChildren.has(this.id!));
	isBlocked = $derived(discogsApi.isBlockedDiscogsEntity(this.data?.type!, this.data?.discogsId!));

	releaseTotal = $derived.by(() => {
		if (!this.id) return null;

		const paging = graph.visitedNodes.releasePages.get(this.id);

		return paging ? paging.items : null;
	});

	private _hasRelatedArtists = $derived.by(() => {
		if (this.data?.type !== 'artist') return true;
	
		return (this.data?.members?.length ?? 0) > 0 || (this.data?.groups?.length ?? 0) > 0;
	});

	private _hasRelatedLabels = $derived.by(() => {
		if (this.data?.type !== 'label') return true;
	
		return Boolean(this.data?.parent_label) || (this.data?.sublabels?.length ?? 0) > 0;
	});
	
	private _hasRelatedAliases = $derived.by(() => {
		if (this.data?.type !== 'artist') return true;
	
		return (this.data?.aliases?.length ?? 0) > 0;
	});
	
	private _hasMainRelease = $derived.by(() => {
		if (this.data?.type !== 'master') return true;

		return Boolean(this.data?.main_release_info);
	});

	visibleLoadActions = $derived.by(() => {
		if (!this.data || this.isBlocked) return [];

		return LOAD_ACTIONS[this.data.type].filter((action) => {
			if (action === 'artists' && !this._hasRelatedArtists) return false;
			if (action === 'labels' && !this._hasRelatedLabels) return false;
			if (action === 'aliases' && !this._hasRelatedAliases) return false;
			if (action === 'main_release' && !this._hasMainRelease) return false;
	
			return true;
		});
	});

	collapseNode() {
		if (!this.hasChildren) return;

		const descendants = collectDescendants(this.id!, graph.visitedNodes.knownChildren);
		if (descendants.size === 0) return;

		const collapsedIds = new Set(descendants);
		collapsedIds.add(this.id!);

		graph.data.removeNodes(descendants);
		graph.visitedNodes.resetNodeMaps(collapsedIds, descendants);

		if (graph.data.nodes.size === 1) {
			graph.display.viewResetToken++;
		}
	}

	async fetchNodeDetails() {
		if (this.isDetailsFetched || this.isDetailsLoading || this.isDetailsFailed) return;

		const { type, discogsId } = parseNodeId(this.id!);

		if (!type || !discogsId) return;

		if (this.isBlocked) {
			graph.visitedNodes.setDetailStatus(this.id!, 'fetched');
			return;
		}

		graph.visitedNodes.setDetailStatus(this.id!, 'loading');

		const config = DETAIL_CONFIG[type as NodeType];

		const payload = await discogsApi.withRequest(
			() => config.fetch(discogsId),
			config.errorMessage
		);

		if (!payload) {
			graph.visitedNodes.setDetailStatus(this.id!, 'failed');
			return;
		}

		await config.merge(this.data!, graph, payload);

		graph.visitedNodes.setDetailStatus(this.id!, 'fetched');
	}
}

export const selectedNodeState = new SelectedNodeState();
