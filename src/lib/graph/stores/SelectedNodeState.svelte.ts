import { graph } from '../graph';

import { expansionProgressState } from './ExpansionProgressState.svelte';
import { expansionState } from './ExpansionState.svelte';
import { nodeDetailsState } from './NodeDetailsState.svelte';
import { LOAD_ACTIONS} from '$lib/components/workspace/actions/constants';


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

	private _hasRelatedArtists = $derived.by(() => {
		if (this.node?.type !== 'artist') return true;
	
		return (this.node?.members?.length ?? 0) > 0 || (this.node?.groups?.length ?? 0) > 0;
	});

	private _hasRelatedLabels = $derived.by(() => {
		if (this.node?.type !== 'label') return true;
	
		return Boolean(this.node?.parent_label) || (this.node?.sublabels?.length ?? 0) > 0;
	});
	
	private _hasRelatedAliases = $derived.by(() => {
		if (this.node?.type !== 'artist') return true;
	
		return (this.node?.aliases?.length ?? 0) > 0;
	});
	
	private _hasMainRelease = $derived.by(() => {
		if (this.node?.type !== 'master') return true;
	
		return this.node?.main_release ? true : !this.isDetailsFetched;
	});

	getVisibleLoadActions = $derived.by(() => {
		if (!this.node) return [];
	
		return LOAD_ACTIONS[this.node.type].filter((action) => {
			if (action === 'artists' && !this._hasRelatedArtists) return false;
			if (action === 'labels' && !this._hasRelatedLabels) return false;
			if (action === 'aliases' && !this._hasRelatedAliases) return false;
			if (action === 'main_release' && !this._hasMainRelease) return false;
	
			return true;
		});
	});

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
