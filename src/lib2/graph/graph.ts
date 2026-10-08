import GraphDataState from './stores/GraphDataState.svelte';
import GraphPresentationState from './stores/GraphPresentationState.svelte';

class Graph {
	readonly data = GraphDataState;
	readonly presentation = GraphPresentationState;

	clear() {
		this.presentation.clear();
		this.data.clear();
	}
}

export const graph = new Graph();
