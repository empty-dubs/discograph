<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const node = $derived(selectedNodeState);
	const isNodeLoading = $derived(
		node.id ? graph.progress.isLoading(node.id) : false
	);
</script>

<button
	type="button"
	class="font-inherit hover:bg-panel flex cursor-pointer items-center rounded border-none bg-transparent px-1.5 py-0.5 text-inherit disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
	aria-pressed={graph.display.showNodeLabels}
	onclick={() => graph.display.toggleNodeLabels()}
>
	{graph.display.showNodeLabels ? 'Hide labels' : 'Show labels'}
</button>

<button
	type="button"
	class="border-border bg-panel hover:bg-panel-hover cursor-pointer rounded-md border px-3 py-1.5 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
	disabled={isNodeLoading}
	onclick={() => {
		graph.data.clear();
		discogsApi.clear();
	}}
>
	Clear graph
</button>
