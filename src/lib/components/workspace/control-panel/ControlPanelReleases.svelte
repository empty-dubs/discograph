<script lang="ts">
	import { RELEASES_TAB_LOAD_ACTIONS } from '$lib/components/shared/constants';
	import { graph } from '$lib/graph/graph';
	
	import NodeLoadActions from '$lib/components/shared/NodeLoadActions.svelte';
	import SelectedNodeState from '$lib/stores/SelectedNodeState.svelte';
	import SearchableList from './SearchableList.svelte';

	import {
		getReleaseListItems,
		isReleaseParentType
	} from './control-panel-discover-releases';

	const node = $derived(SelectedNodeState);

	const releaseListItems = $derived(
		node.id
		&& node.data
		&& (
			graph.visitedNodes.releasePages.get(node.id)
			|| graph.visitedNodes.masterReleasePages.get(node.id)
		)
		? getReleaseListItems(node.data, graph)
		: []
	);
</script>

<div class="flex h-full min-h-0 flex-col gap-4">
	<div class="flex w-full min-w-0 shrink-0 flex-col gap-2">
		<NodeLoadActions
			showAllActions
			actionTypes={RELEASES_TAB_LOAD_ACTIONS}
			layout="stack"
			buttonVariant="standard"
			buttonLayout="row"
		/>
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto text-muted text-sm m-0">
		{#if !node.id || !node.data}
			<p>Select an artist, label, or master and load masters or releases to begin.</p>
		{:else if !isReleaseParentType(node.data.type)}
			<p>Selected node must be an artist, label, or master.</p>
		{:else if node.hasLoadingChildren && releaseListItems.length === 0}
			<p>Loading releases...</p>
		{:else if releaseListItems.length === 0}
			<p>Use Load master releases or Load releases above to fetch release data.</p>
		{:else}
			<SearchableList items={releaseListItems} />
		{/if}
	</div>
</div>
