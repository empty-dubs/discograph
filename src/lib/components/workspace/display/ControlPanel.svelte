<script lang="ts">
	import { graph } from '$lib/graph/stores/graph.svelte';

	import GraphDisplayOptions from './control-panel/GraphDisplayOptions.svelte';
	import GraphNodeFilters from './control-panel/GraphNodeFilters.svelte';
	import GraphOperations from './control-panel/GraphOperations.svelte';

	const node = $derived(graph.nodes.get(graph.display.selectedId ?? '') ?? null);
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

	{#if node}
		<GraphOperations {node} />
	{/if}
</div>
