<script lang="ts">
	import GraphDisplayOptions from './control-panel/GraphDisplayOptions.svelte';
	import GraphNodeFilters from './control-panel/GraphNodeFilters.svelte';
	import GraphOperations from './control-panel/GraphOperations.svelte';
</script>

<div class="flex flex-col gap-3">
	<div
		class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400"
		role="group"
		aria-label="Node type visibility"
	>
		<GraphNodeFilters />
		<GraphDisplayOptions />
	</div>

	<GraphOperations />
</div>
