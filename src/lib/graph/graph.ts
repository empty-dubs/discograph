import { graphDataState, type GraphDataState } from './stores/GraphDataState.svelte';
import { visitedNodesState, type VisitedNodesState } from './stores/VisitedNodesState.svelte';
import { expansionState, type ExpansionState } from './stores/ExpansionState.svelte';
import { expansionProgressState, type ExpansionProgressState } from './stores/ExpansionProgressState.svelte';
import { graphDisplayState, type GraphDisplayState } from './stores/DisplayState.svelte';

export interface GraphInterface {
	readonly data: GraphDataState;
	readonly display: GraphDisplayState;
	readonly expansion: ExpansionState;
	readonly progress: ExpansionProgressState;
	readonly visitedNodes: VisitedNodesState;
	clear(): void;
}

class Graph implements GraphInterface {
	readonly data = graphDataState;
	readonly display = graphDisplayState;
	readonly expansion = expansionState;
	readonly progress = expansionProgressState;
	readonly visitedNodes = visitedNodesState;

	clear() {
		this.display.clear();
		this.expansion.clear();
		this.progress.clear();
		this.visitedNodes.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
