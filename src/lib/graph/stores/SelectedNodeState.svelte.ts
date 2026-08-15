import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { buildConfig } from './VisitedNodesState.svelte';
import type { NodeType } from '../types';
import { parseNodeId } from '$lib/graph/operations/transformations';

interface SelectedNodeInterface {
	id: string | null;
}

class SelectedNodeState implements SelectedNodeInterface {
	id = $derived(graph.display.selectedId);
    node = $derived(graph.data.nodes.get(this.id!));

	hasChildren = $derived(graph.expansion.hasChildren(this.id!));
	hasMoreReleases = $derived(graph.progress.hasMoreReleases(this.id!));
	hasMoreMasterReleases = $derived(graph.progress.hasMoreMasterReleases(this.id!));
	isDetailsLoading = $derived(graph.visitedNodes.visited.get(this.id!) === 'loading');
	isDetailsFetched = $derived(graph.visitedNodes.visited.get(this.id!) === 'fetched');
	isLoading = $derived(graph.progress.isLoading(this.id!));

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
	
		return this.node?.main_release ? true : !this.isDetailsFetched;
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
		graph.expansion.collapseNode(this.id!, {
			onNodesRemoved: (nodeIds) => {
				graph.progress.clearNodes(nodeIds);
				graph.progress.clearNodeLoadState(this.id!);
			}
		});
	}

	setStatus(status: 'loading' | 'fetched' | 'idle') {
		graph.visitedNodes.visited.set(this.id!, status);
	}

	async fetchNodeDetails() {
		if (this.isDetailsFetched || this.isDetailsLoading) return;

		const { type, discogsId } = parseNodeId(this.id!);

		if (!type || !discogsId) return;

		this.setStatus('loading');
		this.isDetailsLoading = true;

		const config = buildConfig[type as NodeType];

		const payload = await discogsApi.withRequest(
			() => config.fetch(discogsId),
			config.errorMessage
		);

		if (!payload) {
			this.setStatus('idle');
			this.isDetailsLoading = false;
			return;
		}

		await config.merge(this.node!, graph, payload);

		this.setStatus('fetched');
		this.isDetailsLoading = false;
		this.isDetailsFetched = true;
	}
}

export const selectedNodeState = new SelectedNodeState();
