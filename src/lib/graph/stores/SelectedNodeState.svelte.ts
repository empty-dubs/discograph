import { graph } from '../graph';

import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';
import type { LoadAction } from '$lib/components/workspace/actions/constants';
import { stripDiscogsWikiMarkup } from '$lib/components/workspace/node-panel/transformations';
import { discogsApi } from '$lib/discogs/discogs.svelte';
import { DETAIL_CONFIG } from '$lib/graph/node-load-config';
import { getLinkId, getNodeId } from '$lib/graph/operations/patches/compositions';
import { parseNodeId } from '$lib/graph/operations/transformations';
import { collectDescendants } from '../operations/crawlers';

import type { GraphNode, NodeType } from '../types';

const PATCH_LOAD_ACTIONS = new Set<LoadAction>([
	'artists',
	'labels',
	'aliases',
	'companies',
	'credited_artists',
	'main_release'
]);

export type RelatedNeighbors = {
	nodes: string[];
	edges: string[];
};

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

	private relatedNeighbors(action: LoadAction): RelatedNeighbors {
		const node = this.data;

		if (!node) return { nodes: [], edges: [] };

		switch (action) {
			case 'artists':
				if (node.type === 'artist') {
					const nodes = [
						...(node.members ?? []).map((member) => getNodeId('artist', member.id)),
						...(node.groups ?? []).map((group) => getNodeId('artist', group.id))
					];
					const edges = [
						...(node.members ?? []).map((member) =>
							getLinkId(getNodeId(node.type, member.id), 'member_of', node.id)
						),
						...(node.groups ?? []).map((group) =>
							getLinkId(node.id, 'member_of', getNodeId(node.type, group.id))
						)
					];

					return { nodes, edges };
				}

				if (node.type === 'master') {
					const sourceNodeId =  node.main_release
					? `${node.id}-${getNodeId('release', node.main_release)}`
					: node.id;
					const nodes = (node.artists ?? []).map((artist) => getNodeId('artist', artist.id));
					const edges = nodes.map((id) => getLinkId(id, 'released', sourceNodeId));

					return { nodes, edges };
				}

				if (node.type === 'release') {
					const nodes = (node.artists ?? []).map((artist) => getNodeId('artist', artist.id));
					const edges = nodes.map((id) => getLinkId(id, 'released', node.id));

					return { nodes, edges };
				}

				return { nodes: [], edges: [] };

			case 'labels':
				if (node.type === 'label') {
					const nodes: string[] = [];
					const edges: string[] = [];

					for (const sublabel of node.sublabels ?? []) {
						const id = getNodeId(node.type, sublabel.id);
						nodes.push(id);
						edges.push(getLinkId(id, 'sublabel_of', node.id));
					}

					if (node.parent_label) {
						const id = getNodeId(node.type, node.parent_label.id);
						nodes.push(id);
						edges.push(getLinkId(node.id, 'sublabel_of', id));
					}

					return { nodes, edges };
				}

				if (node.type === 'release') {
					const nodes = (node.labels ?? []).map((label) => getNodeId('label', label.id));
					const edges = nodes.map((id) => getLinkId(node.id, 'on_label', id));

					return { nodes, edges };
				}

				return { nodes: [], edges: [] };

			case 'aliases': {
				const nodes = (node.aliases ?? []).map((alias) => getNodeId(node.type, alias.id));
				const edges = nodes.map((id) => getLinkId(id, 'alias_of', node.id));

				return { nodes, edges };
			}

			case 'companies': {
				const nodes = (node.companies ?? []).map((company) => getNodeId('label', company.id));
				const edges = nodes.map((id) => getLinkId(id, 'company_on', node.id));

				return { nodes, edges };
			}

			case 'credited_artists': {
				const nodes = (node.credits ?? []).map((credit) => getNodeId('artist', credit.id));
				const edges = nodes.map((id) => getLinkId(id, 'credited_on', node.id));

				return { nodes, edges };
			}

			case 'main_release': {
				if (node.type !== 'master' || !node.main_release_info) {
					return { nodes: [], edges: [] };
				}

				const releaseId = getNodeId('release', node.main_release_info.id);

				return {
					nodes: [releaseId],
					edges: [getLinkId(node.id, 'version_of', releaseId)]
				};
			}

			default:
				return { nodes: [], edges: [] };
		}
	}

	hasFullyLinkedNeighbors(action: LoadAction): boolean {
		if (!PATCH_LOAD_ACTIONS.has(action)) return false;

		const { edges } = this.relatedNeighbors(action);

		return edges.every((id) => graph.data.links.has(id));
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
