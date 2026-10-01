import GraphDataState from './stores/GraphDataState.svelte';
import GraphDisplayState from './stores/GraphPresentationState.svelte';

class Graph {
	readonly data = GraphDataState;
	readonly presentation = GraphDisplayState;

	clear() {
		this.presentation.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
