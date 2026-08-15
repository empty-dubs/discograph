<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import GraphDisplayOptions from './control-panel/GraphDisplayOptions.svelte';
	import GraphNodeFilters from './control-panel/GraphNodeFilters.svelte';
	import GraphOperations from './control-panel/GraphOperations.svelte';

	const node = $derived(selectedNodeState);
</script>

<div class="flex flex-col gap-3">
	<div
		class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400"
		role="group"
		aria-label="Node type visibility"
	>
		<GraphNodeFilters />

		{#if !graph.data.isEmpty}
			<GraphDisplayOptions />
		{/if}
	</div>

	{#if node.isDetailsFetched}
		<GraphOperations />
	{/if}
</div>
