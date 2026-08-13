import { graphDataState, type GraphDataState } from './GraphDataState.svelte';
import { nodeDetailsState, type NodeDetailsState } from './NodeDetailsState.svelte';
import { expansionState, type ExpansionState } from './ExpansionState.svelte';
import { expansionProgressState, type ExpansionProgressState } from './ExpansionProgressState.svelte';
import { graphDisplayState, type GraphDisplayState } from './DisplayState.svelte';

import type { GraphLink, GraphNode } from '../types';
import type { LoadAction } from '$lib/components/workspace/actions/constants';

export interface GraphInterface {
	readonly data: GraphDataState;
	readonly display: GraphDisplayState;
	readonly expansion: ExpansionState;
	readonly progress: ExpansionProgressState;
	readonly details: NodeDetailsState;
	readonly nodes: Map<string, GraphNode>;
	readonly links: Map<string, GraphLink>;
	readonly nodeList: GraphNode[];
	readonly linkList: GraphLink[];
	readonly releasePages: Map<string, { page: number; pages: number }>;
	readonly masterReleasePages: Map<string, { page: number; pages: number }>;
	readonly loadedActions: Map<string, Set<LoadAction>>;

	clear(): void;
	collapseNode(nodeId: string): void;
	hasChildren(nodeId: string): boolean;
	hasMoreReleases(nodeId: string): boolean;
	hasMoreMasterReleases(nodeId: string): boolean;
	isDetailsLoading(nodeId: string): boolean;
	isDetailsFetched(nodeId: string): boolean;
	ensureArtistDetails(nodeId: string): Promise<void>;
	ensureLabelDetails(nodeId: string): Promise<void>;
	ensureMasterDetails(nodeId: string): Promise<void>;
	ensureReleaseDetails(nodeId: string): Promise<void>;
}

class Graph implements GraphInterface {
	readonly data = graphDataState;
	readonly display = graphDisplayState;
	readonly expansion = expansionState;
	readonly progress = expansionProgressState;
	readonly details = nodeDetailsState;

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
