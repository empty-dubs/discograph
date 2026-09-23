import { LOAD_ACTIONS, PATCH_LOAD_ACTIONS } from '$lib/components/workspace/actions/constants';
import { stripDiscogsWikiMarkup } from '$lib/components/workspace/node-panel/transformations';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import {
	collectDescendants,
	getRelatedNeighbors,
} from '$lib/graph/operations/crawlers';
import { fetchNodeDetails } from '$lib/graph/operations/fetch-node-details';

import { graph } from '$lib/graph/graph';

import type { LoadAction } from '$lib/components/workspace/actions/constants';
import type { GraphNode } from '../types';

export interface SelectedNodeInterface {
	id: string | null;
	data?: GraphNode;
	hasChildren: boolean;
	hasMoreReleases: boolean;
	hasMoreMasterReleases: boolean;
	isDetailsLoading: boolean;
	isDetailsFetched: boolean;
	isDetailsFailed: boolean;
	isProfileLoading: boolean;
	isProfileFetched: boolean;
	isProfileFailed: boolean;
	hasLoadingChildren: boolean;
	isBlocked: boolean;
	releaseTotal: number | null;
	visibleLoadActions: string[];
	hasFullyLinkedNeighbors: (action: LoadAction) => boolean;
	collapseNode: () => void;
	fetchDetails: () => Promise<void>;
	fetchProfile: () => Promise<void>;
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
	isProfileLoading = $derived(graph.visitedNodes.profileStatus.get(this.id!) === 'loading');
	isProfileFetched = $derived(graph.visitedNodes.profileStatus.get(this.id!) === 'fetched');
	isProfileFailed = $derived(graph.visitedNodes.profileStatus.get(this.id!) === 'failed');
	hasLoadingChildren = $derived(graph.visitedNodes.withLoadingChildren.has(this.id!));
	isBlocked = $derived(discogsApi.isBlockedDiscogsEntity(this.data?.type!, this.data?.discogsId!));
	isArtistOrLabel = $derived(this.data?.type === 'artist' || this.data?.type === 'label');
	isMasterOrRelease = $derived(this.data?.type === 'master' || this.data?.type === 'release');

	releaseTotal = $derived.by(() => {
		if (!this.id) return null;

		const masterReleasePaging = graph.visitedNodes.masterReleasePages.get(this.id);
		const releasePaging = graph.visitedNodes.releasePages.get(this.id);

		return masterReleasePaging 
			? masterReleasePaging.items
			: releasePaging
				? releasePaging.items
				: null;
	});

	hasFullyLinkedNeighbors(
		action: LoadAction,
		options?: { requireEdges?: boolean }
	): boolean {
		if (!this.data) return false;
		if (!PATCH_LOAD_ACTIONS.has(action)) return false;
	
		const { edges } = getRelatedNeighbors(this.data, action);
	
		if (options?.requireEdges && edges.length === 0) return false;
	
		return edges.every((id: string) => graph.data.links.has(id));
	}

	visibleLoadActions = $derived.by(() => {
		if (!this.data || this.isBlocked) return [];

		return LOAD_ACTIONS[this.data.type];
	});

	collapseNode() {
		if (!this.hasChildren) return;

		const descendants = collectDescendants(this.id!, graph.visitedNodes.knownChildren);
		if (descendants.size === 0) return;

		const collapsedIds = new Set(descendants);
		collapsedIds.add(this.id!);

		graph.data.removeNodes(descendants);
		graph.visitedNodes.resetNodeMaps(collapsedIds, descendants);
	}

	async fetchDetails() {
		if (!this.id || !this.data) return;

		await fetchNodeDetails(graph, this.data);
	}

	async fetchProfile() {
		const nodeId = this.id;
		const profile = this.data?.profile;

		if (!nodeId || !profile) return;

		const status = graph.visitedNodes.profileStatus.get(nodeId);

		if (status === 'fetched' || status === 'loading') return;
		if (this.isDetailsLoading) return;

		graph.visitedNodes.setProfileStatus(nodeId, 'loading');

		try {
			const processed = await stripDiscogsWikiMarkup(profile);

			graph.data.updateNode(nodeId, { profile: processed });
			graph.visitedNodes.setProfileStatus(nodeId, 'fetched');
		} catch {
			graph.visitedNodes.setProfileStatus(nodeId, 'failed');
		}
	}
}

export const selectedNodeState = new SelectedNodeState();
