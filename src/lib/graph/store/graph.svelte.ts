import { graphDataStore } from './data-store.svelte';
import { detailsStore } from './details-store.svelte';
import { expansionStore } from './expansion-store.svelte';
import { expansionProgressStore } from './expansion-progress-store.svelte';
import { graphUiStore } from './ui-store.svelte';

import { resetGraph, seedFromNode, seedFromResult } from '../actions/seed';

import type { LoadAction } from '$lib/components/workspace/actions/constants';
import type { SearchResult, Master } from '$lib/discogs/types';
import type { GraphLink, GraphNode, GraphPatch, NodeType } from '../types';
import type { GraphFacade } from './types';

class Graph implements GraphFacade {
	readonly data = graphDataStore;
	readonly ui = graphUiStore;
	readonly expansion = expansionStore;
	readonly progress = expansionProgressStore;
	readonly details = detailsStore;

	get nodes() {
		return this.data.nodes;
	}

	get links() {
		return this.data.links;
	}

	get nodeList() {
		return this.data.nodeList;
	}

	get linkList() {
		return this.data.linkList;
	}

	get isEmpty() {
		return this.data.isEmpty;
	}

	get visibleNodeList() {
		return this.ui.visibleNodeList;
	}

	get visibleLinkList() {
		return this.ui.visibleLinkList;
	}

	get typeCounts() {
		return this.ui.typeCounts;
	}

	get selectedNode() {
		return this.ui.selectedNode;
	}

	get selectedId() {
		return this.ui.selectedId;
	}

	get seedId() {
		return this.ui.seedId;
	}

	get visibleTypes() {
		return this.ui.visibleTypes;
	}

	get viewResetToken() {
		return this.ui.viewResetToken;
	}

	get showNodeLabels() {
		return this.ui.showNodeLabels;
	}

	get releasePages() {
		return this.progress.releasePages;
	}

	get masterReleasePages() {
		return this.progress.masterReleasePages;
	}

	get loadedActions() {
		return this.progress.loadedActions;
	}

	parseNodeId(id: string) {
		return this.data.parseNodeId(id);
	}

	applyPatch(patch: GraphPatch) {
		this.data.applyPatch(patch);
	}

	clearGraph() {
		resetGraph(this);
	}

	selectNode(id: string | null) {
		this.ui.selectNode(id);
	}

	isTypeVisible(type: NodeType) {
		return this.ui.isTypeVisible(type);
	}

	toggleType(type: NodeType) {
		this.ui.toggleType(type);
	}

	toggleNodeLabels() {
		this.ui.toggleNodeLabels();
	}

	collapseNode(nodeId: string) {
		this.expansion.collapseNode(nodeId, {
			onNodesRemoved: (nodeIds) => {
				this.progress.clearNodes(nodeIds);
				this.progress.clearNodeLoadState(nodeId);
			}
		});
	}

	hasChildren(nodeId: string) {
		return this.expansion.hasChildren(nodeId);
	}

	isLoading(nodeId: string) {
		return this.progress.isLoading(nodeId);
	}

	hasMoreReleases(nodeId: string) {
		return this.progress.hasMoreReleases(nodeId);
	}

	hasMoreMasterReleases(nodeId: string) {
		return this.progress.hasMoreMasterReleases(nodeId);
	}

	hasLoadedAction(nodeId: string, action: LoadAction) {
		return this.progress.hasLoadedAction(nodeId, action);
	}

	isDetailsLoading(nodeId: string) {
		return this.details.isDetailsLoading(nodeId);
	}

	isDetailsFetched(nodeId: string) {
		return this.details.isDetailsFetched(nodeId);
	}

	seedFromResult(result: SearchResult) {
		seedFromResult(this, result);
	}

	async seedFromNode(node: GraphNode) {
		await seedFromNode(this, node);
	}

	async ensureArtistDetails(nodeId: string) {
		await this.details.ensureArtistDetails(nodeId);
	}

	async ensureLabelDetails(nodeId: string) {
		await this.details.ensureLabelDetails(nodeId);
	}

	async ensureMasterDetails(nodeId: string) {
		await this.details.ensureMasterDetails(nodeId);
	}

	async ensureReleaseDetails(nodeId: string) {
		await this.details.ensureReleaseDetails(nodeId);
	}

	async mergeMasterDetails(nodeId: string, master: Master) {
		await this.details.mergeMasterDetails(nodeId, master);
	}
}

export const graph = new Graph();

export type GraphContext = Pick<
	Graph,
	'data' | 'ui' | 'expansion' | 'progress' | 'details'
>;
