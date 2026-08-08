import { discogsApiStore } from '$lib/discogs/api.svelte';

import { graphCtx } from './context';
import { graphDataStore } from './data-store.svelte';
import { detailsStore } from './details-store.svelte';
import { expansionStore } from './expansion-store.svelte';
import { expansionProgressStore } from './expansion-progress-store.svelte';
import { graphUiStore } from './ui-store.svelte';

import { seedFromNode, seedFromResult } from '../actions/seed';

import type { SearchResult } from '$lib/discogs/types';
import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';
import type { GraphFacade } from './types';

class GraphStore implements GraphFacade {
	get nodes() {
		return graphDataStore.nodes;
	}

	get links() {
		return graphDataStore.links;
	}

	get nodeList() {
		return graphDataStore.nodeList;
	}

	get linkList() {
		return graphDataStore.linkList;
	}

	get visibleNodeList() {
		return graphUiStore.visibleNodeList;
	}

	get visibleLinkList() {
		return graphUiStore.visibleLinkList;
	}

	get typeCounts() {
		return graphUiStore.typeCounts;
	}

	get selectedNode() {
		return graphUiStore.selectedNode;
	}

	get selectedId() {
		return graphUiStore.selectedId;
	}

	get seedId() {
		return graphUiStore.seedId;
	}

	get visibleTypes() {
		return graphUiStore.visibleTypes;
	}

	get viewResetToken() {
		return graphUiStore.viewResetToken;
	}

	get releasePages() {
		return expansionProgressStore.releasePages;
	}

	get masterReleasePages() {
		return expansionProgressStore.masterReleasePages;
	}

	parseNodeId(id: string) {
		return graphDataStore.parseNodeId(id);
	}

	applyPatch(patch: GraphPatch) {
		graphDataStore.applyPatch(patch);
	}

	clearGraph() {
		graphDataStore.clear();
		expansionStore.clear();
		expansionProgressStore.clear();
		detailsStore.clear();
		graphUiStore.clear();
		discogsApiStore.clearError();
		discogsApiStore.clearSearchResults();
	}

	selectNode(id: string | null) {
		graphUiStore.selectNode(id);
	}

	isTypeVisible(type: NodeType) {
		return graphUiStore.isTypeVisible(type);
	}

	toggleType(type: NodeType) {
		graphUiStore.toggleType(type);
	}

	collapseNode(nodeId: string) {
		expansionStore.collapseNode(nodeId, {
			onNodesRemoved: (nodeIds) => {
				expansionProgressStore.clearNodes(nodeIds);
			}
		});
	}

	hasChildren(nodeId: string) {
		return expansionStore.hasChildren(nodeId);
	}

	isLoading(nodeId: string) {
		return expansionProgressStore.isLoading(nodeId);
	}

	hasMoreReleases(nodeId: string) {
		return expansionProgressStore.hasMoreReleases(nodeId);
	}

	hasMoreMasterReleases(nodeId: string) {
		return expansionProgressStore.hasMoreMasterReleases(nodeId);
	}

	isDetailsLoading(nodeId: string) {
		return detailsStore.isDetailsLoading(nodeId);
	}

	seedFromResult(result: SearchResult) {
		seedFromResult(graphCtx, result);
	}

	async seedFromNode(node: GraphNode) {
		await seedFromNode(graphCtx, node);
	}

	async ensureArtistDetails(nodeId: string) {
		await detailsStore.ensureArtistDetails(nodeId);
	}

	async ensureLabelDetails(nodeId: string) {
		await detailsStore.ensureLabelDetails(nodeId);
	}

	async ensureMasterDetails(nodeId: string) {
		await detailsStore.ensureMasterDetails(nodeId);
	}

	async ensureReleaseDetails(nodeId: string) {
		await detailsStore.ensureReleaseDetails(nodeId);
	}

	async mergeMasterDetails(nodeId: string, master: import('$lib/discogs/types').Master) {
		await detailsStore.mergeMasterDetails(nodeId, master);
	}
}

export const graphStore = new GraphStore();
