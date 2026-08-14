import { graphDataState, type GraphDataState } from './stores/GraphDataState.svelte';
import { nodeDetailsState, type NodeDetailsState } from './stores/NodeDetailsState.svelte';
import { expansionState, type ExpansionState } from './stores/ExpansionState.svelte';
import { expansionProgressState, type ExpansionProgressState } from './stores/ExpansionProgressState.svelte';
import { graphDisplayState, type GraphDisplayState } from './stores/DisplayState.svelte';

export interface GraphInterface {
	readonly data: GraphDataState;
	readonly display: GraphDisplayState;
	readonly expansion: ExpansionState;
	readonly progress: ExpansionProgressState;
	readonly details: NodeDetailsState;
	clear(): void;
}

class Graph implements GraphInterface {
	readonly data = graphDataState;
	readonly display = graphDisplayState;
	readonly expansion = expansionState;
	readonly progress = expansionProgressState;
	readonly details = nodeDetailsState;

	clear() {
		this.display.clear();
		this.expansion.clear();
		this.progress.clear();
		this.details.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
