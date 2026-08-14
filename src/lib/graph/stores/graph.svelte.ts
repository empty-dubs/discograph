import { graphDataState, type GraphDataState } from './GraphDataState.svelte';
import { nodeDetailsState, type NodeDetailsState } from './NodeDetailsState.svelte';
import { expansionState, type ExpansionState } from './ExpansionState.svelte';
import { expansionProgressState, type ExpansionProgressState } from './ExpansionProgressState.svelte';
import { graphDisplayState, type GraphDisplayState } from './DisplayState.svelte';

import type { LoadAction } from '$lib/components/workspace/actions/constants';

export interface GraphInterface {
	readonly data: GraphDataState;
	readonly display: GraphDisplayState;
	readonly expansion: ExpansionState;
	readonly progress: ExpansionProgressState;
	readonly details: NodeDetailsState;
	readonly releasePages: Map<string, { page: number; pages: number }>;
	readonly masterReleasePages: Map<string, { page: number; pages: number }>;
	readonly loadedActions: Map<string, Set<LoadAction>>;

	clear(): void;
	collapseNode(nodeId: string): void;
	hasChildren(nodeId: string): boolean;
}

class Graph implements GraphInterface {
	readonly data = graphDataState;
	readonly display = graphDisplayState;
	readonly expansion = expansionState;
	readonly progress = expansionProgressState;
	readonly details = nodeDetailsState;

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
}

export const graph = new Graph();
