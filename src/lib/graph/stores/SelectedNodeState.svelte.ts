import { graph } from './graph.svelte';

import { nodeDetailsState } from './NodeDetailsState.svelte';

interface SelectedNodeInterface {
	id: string | null;
}

class SelectedNodeState implements SelectedNodeInterface {
	id = $derived(graph.display.selectedId);
    node = $derived(graph.data.nodes.get(this.id!));

	ensureDetails() {
		switch (this.node?.type) {
			case 'artist':
				return nodeDetailsState.ensureArtistDetails(this.id!);
			case 'label':
				return nodeDetailsState.ensureLabelDetails(this.id!);
			case 'master':
				return nodeDetailsState.ensureMasterDetails(this.id!);
			case 'release':
				return nodeDetailsState.ensureReleaseDetails(this.id!);
		}
	}
}

export const selectedNodeState = new SelectedNodeState();
