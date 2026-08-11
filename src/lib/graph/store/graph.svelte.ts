import { graphDataStore } from './data-store.svelte';
import { detailsStore } from './details-store.svelte';
import { expansionStore } from './expansion-store.svelte';
import { expansionProgressStore } from './expansion-progress-store.svelte';
import { graphDisplayStore } from './display-store.svelte';

import type { GraphInterface } from './types';

export class Graph implements GraphInterface {
	readonly data = graphDataStore;
	readonly display = graphDisplayStore;
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

	get releasePages() {
		return this.progress.releasePages;
	}

	get masterReleasePages() {
		return this.progress.masterReleasePages;
	}

	get loadedActions() {
		return this.progress.loadedActions;
	}

	clear() {
		this.data.clear();
		this.expansion.clear();
		this.progress.clear();
		this.details.clear();
		this.display.clear();
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

	hasMoreReleases(nodeId: string) {
		return this.progress.hasMoreReleases(nodeId);
	}

	hasMoreMasterReleases(nodeId: string) {
		return this.progress.hasMoreMasterReleases(nodeId);
	}

	isDetailsLoading(nodeId: string) {
		return this.details.isDetailsLoading(nodeId);
	}

	isDetailsFetched(nodeId: string) {
		return this.details.isDetailsFetched(nodeId);
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
}

export const graph = new Graph();
