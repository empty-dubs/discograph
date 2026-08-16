import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { buildConfig } from './VisitedNodesState.svelte';
import type { NodeType } from '../types';
import { parseNodeId } from '$lib/graph/operations/transformations';

import { collectDescendants } from '../operations/crawlers';

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
		if (!this.hasChildren) return;

		const descendants = collectDescendants(this.id!, graph.visitedNodes.knownChildren);

		if (descendants.size === 0) {
			const nextExpanded = new Set(graph.visitedNodes.expanded);

			nextExpanded.delete(this.id!);

			graph.visitedNodes.expanded = nextExpanded;
			return;
		}

		graph.data.removeNodes(descendants);

		const nextChildren = new Map(graph.visitedNodes.knownChildren);
		for (const id of descendants) nextChildren.delete(id);

		const parentChildren = new Set(nextChildren.get(this.id!) ?? []);
		for (const id of descendants) parentChildren.delete(id);

		if (parentChildren.size === 0) {
			nextChildren.delete(this.id!);
		} else {
			nextChildren.set(this.id!, parentChildren);
		}
		graph.visitedNodes.knownChildren = nextChildren;

		const nextExpanded = new Set(graph.visitedNodes.expanded);
		nextExpanded.delete(this.id!);
		for (const id of descendants) nextExpanded.delete(id);

		graph.visitedNodes.expanded = nextExpanded;

		if (graph.display.selectedId && descendants.has(graph.display.selectedId)) {
			graph.display.selectedId = this.id!;
		}

		graph.visitedNodes.clearNodes(descendants);
		graph.visitedNodes.clearNodeLoadState(this.id!);

		if (graph.data.nodes.size === 1) {
			graph.display.viewResetToken++;
		}
	}

	setStatus(status: 'loading' | 'fetched' | 'idle') {
		graph.visitedNodes.status.set(this.id!, status);
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
