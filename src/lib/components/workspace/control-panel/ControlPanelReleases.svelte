<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import {
		getReleaseListItems,
		isReleaseParentType
	} from './control-panel-discover-releases';

	import SearchableList from '$lib/components/shared/SearchableList.svelte';

	const node = $derived(selectedNodeState);
	const releaseListItems = $derived(
		node.data
		? getReleaseListItems(node.data, graph)
		: []
	);
</script>

{#if !node.id || !node.data}
	<p class="text-muted m-0 text-sm">Select an artist, label, or master and load masters or releases to begin.</p>
{:else if !isReleaseParentType(node.data.type)}
	<p class="text-muted m-0 text-sm">
		Selected node must be an artist, label, or master.
	</p>
{:else if node.hasLoadingChildren}
	<p class="text-muted m-0 text-sm">Loading releases...</p>
{:else if releaseListItems.length === 0}
	<p class="text-muted m-0 text-sm">
		Use Explore → Load releases or Load master releases to view releases.
	</p>
{:else}
	<SearchableList items={releaseListItems} />
{/if}
