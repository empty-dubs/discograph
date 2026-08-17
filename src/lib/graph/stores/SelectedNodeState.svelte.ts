import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { DETAIL_CONFIG } from '$lib/graph/node-load-config';
import { parseNodeId } from '$lib/graph/operations/transformations';
import { collectDescendants } from '../operations/crawlers';

import type { NodeType } from '../types';

interface SelectedNodeInterface {
	id: string | null;
}

class SelectedNodeState implements SelectedNodeInterface {
	id = $derived(graph.display.selectedId);
    node = $derived(graph.data.nodes.get(this.id!));

	hasChildren = $derived(graph.visitedNodes.knownChildren.has(this.id!));
	hasMoreReleases = $derived(graph.visitedNodes.hasMoreReleases(this.id!));
	hasMoreMasterReleases = $derived(graph.visitedNodes.hasMoreMasterReleases(this.id!));
	isDetailsLoading = $derived(graph.visitedNodes.status.get(this.id!) === 'loading');
	isDetailsFetched = $derived(graph.visitedNodes.status.get(this.id!) === 'fetched');
	isLoading = $derived(graph.visitedNodes.loading.has(this.id!));

	private _hasRelatedArtists = $derived.by(() => {
		if (this.node?.type !== 'artist') return true;
	
		return (this.node?.members?.length ?? 0) > 0 || (this.node?.groups?.length ?? 0) > 0;
	});

	private _hasRelatedLabels = $derived.by(() => {
		if (this.node?.type !== 'label') return true;
	
		return Boolean(this.node?.parent_label) || (this.node?.sublabels?.length ?? 0) > 0;
	});
	
	private _hasRelatedAliases = $derived.by(() => {
		if (this.node?.type !== 'artist') return true;
	
		return (this.node?.aliases?.length ?? 0) > 0;
	});
	
	private _hasMainRelease = $derived.by(() => {
		if (this.node?.type !== 'master') return true;

		return Boolean(this.node?.main_release);
	});

	getVisibleLoadActions = $derived.by(() => {
		if (!this.node) return [];
	
		return LOAD_ACTIONS[this.node.type].filter((action) => {
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
		if (this.isDetailsFetched || this.isDetailsLoading) return;

		const { type, discogsId } = parseNodeId(this.id!);

		if (!type || !discogsId) return;

		graph.visitedNodes.setDetailStatus(this.id!, 'loading');

		const config = DETAIL_CONFIG[type as NodeType];

		const payload = await discogsApi.withRequest(
			() => config.fetch(discogsId),
			config.errorMessage
		);

		if (!payload) {
			graph.visitedNodes.setDetailStatus(this.id!, 'idle');
			return;
		}

		await config.merge(this.node!, graph, payload);

		graph.visitedNodes.setDetailStatus(this.id!, 'fetched');
	}
}

export const selectedNodeState = new SelectedNodeState();
