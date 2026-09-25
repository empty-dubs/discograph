<script lang="ts">
	import { RELEASES_TAB_LOAD_ACTIONS } from '$lib/components/workspace/actions/constants';
	import NodeLoadActions from '$lib/components/workspace/actions/NodeLoadActions.svelte';
	import { graph } from '$lib/graph/graph';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	
	import SearchableList from '$lib/components/shared/SearchableList.svelte';

	import {
		getReleaseListItems,
		isReleaseParentType
	} from './control-panel-discover-releases';

	const node = $derived(selectedNodeState);

	const releaseListItems = $derived(
		node.id && node.data
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

	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if !node.id || !node.data}
			<p class="text-muted m-0 text-sm">
				Select an artist, label, or master and load masters or releases to begin.
			</p>
		{:else if !isReleaseParentType(node.data.type)}
			<p class="text-muted m-0 text-sm">Selected node must be an artist, label, or master.</p>
		{:else if node.hasLoadingChildren}
			<p class="text-muted m-0 text-sm">Loading releases...</p>
		{:else if releaseListItems.length === 0}
			<p class="text-muted m-0 text-sm">
				Use Load master releases or Load releases above to fetch release data.
			</p>
		{:else}
			<SearchableList items={releaseListItems} />
		{/if}
	</div>
</div>
