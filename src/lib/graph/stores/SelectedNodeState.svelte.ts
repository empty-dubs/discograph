import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import type { LoadAction } from '$lib/components/workspace/actions/constants';
import { stripDiscogsWikiMarkup } from '$lib/components/workspace/node-panel/transformations';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { DETAIL_CONFIG } from '$lib/graph/node-load-config';
import { getNodeId } from '$lib/graph/operations/patches/compositions';
import { parseNodeId } from '$lib/graph/operations/transformations';
import { collectDescendants } from '../operations/crawlers';

import type { GraphNode, NodeType } from '../types';

const PATCH_LOAD_ACTIONS = new Set<LoadAction>([
	'artists',
	'labels',
	'aliases',
	'companies',
	'credited_artists'
]);

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
	hasRelatedNeighbors: (action: LoadAction) => boolean;
	collapseNode: () => void;
	fetchNodeDetails: () => Promise<void>;
	fetchNodeProfile: () => Promise<void>;
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

	private _hasMainRelease = $derived.by(() => {
		if (this.data?.type !== 'master') return true;

		return Boolean(this.data?.main_release_info);
	});

	private targetNeighbors(action: LoadAction): string[] {
		const node = this.data;

		if (!node) return [];

		switch (action) {
			case 'artists':
				if (node.type === 'artist') {
					return [
						...(node.members ?? []).map((member) => getNodeId('artist', member.id)),
						...(node.groups ?? []).map((group) => getNodeId('artist', group.id))
					];
				}

				if (node.type === 'release' || node.type === 'master') {
					return (node.artists ?? []).map((artist) => getNodeId('artist', artist.id));
				}

				return [];

			case 'labels':
				if (node.type === 'label') {
					const targets: string[] = [];

					if (node.parent_label) {
						targets.push(getNodeId('label', node.parent_label.id));
					}

					for (const sublabel of node.sublabels ?? []) {
						targets.push(getNodeId('label', sublabel.id));
					}

					return targets;
				}

				if (node.type === 'release') {
					return (node.labels ?? []).map((label) => getNodeId('label', label.id));
				}

				return [];

			case 'aliases':
				return (node.aliases ?? []).map((alias) => getNodeId('artist', alias.id));

			case 'companies':
				return (node.companies ?? []).map((company) => getNodeId('label', company.id));

			case 'credited_artists':
				return (node.credits ?? []).map((credit) => getNodeId('artist', credit.id));

			default:
				return [];
		}
	}

	hasRelatedNeighbors(action: LoadAction): boolean {
		if (!PATCH_LOAD_ACTIONS.has(action)) return true;

		return this.targetNeighbors(action).length > 0;
	}

	visibleLoadActions = $derived.by(() => {
		if (!this.data || this.isBlocked) return [];

		return LOAD_ACTIONS[this.data.type].filter((action) => {
			if (action === 'main_release' && !this._hasMainRelease) return false;
			if (!this.hasRelatedNeighbors(action)) return false;

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

	async fetchNodeProfile() {
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
