import { graph } from '../graph';

import { expansionProgressState } from './ExpansionProgressState.svelte';
import { expansionState } from './ExpansionState.svelte';
import { nodeDetailsState } from './NodeDetailsState.svelte';


interface SelectedNodeInterface {
	id: string | null;
}

class SelectedNodeState implements SelectedNodeInterface {
	id = $derived(graph.display.selectedId);
    node = $derived(graph.data.nodes.get(this.id!));

	hasChildren = $derived(expansionState.hasChildren(this.id!));
	hasMoreReleases = $derived(expansionProgressState.hasMoreReleases(this.id!));
	hasMoreMasterReleases = $derived(expansionProgressState.hasMoreMasterReleases(this.id!));
	isDetailsLoading = $derived(nodeDetailsState.isDetailsLoading(this.id!));
	isDetailsFetched = $derived(nodeDetailsState.isDetailsFetched(this.id!));
	isLoading = $derived(expansionProgressState.isLoading(this.id!));

	collapseNode() {
		expansionState.collapseNode(this.id!, {
			onNodesRemoved: (nodeIds) => {
				expansionProgressState.clearNodes(nodeIds);
				expansionProgressState.clearNodeLoadState(this.id!);
			}
		});
	}

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
