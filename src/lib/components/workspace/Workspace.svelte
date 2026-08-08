<script lang="ts">
	import { graphStore } from '$lib/graph/store/graph-store.svelte';

	import GraphCanvas from './display/GraphCanvas.svelte';
	import GraphLegend from './display/GraphLegend.svelte';
	import NodePanel from './node-panel/NodePanel.svelte';
</script>

<div
	class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:grid-rows-1"
>
	<div class="flex min-h-0 flex-col gap-4 md:h-full">
		<div class="min-h-0 flex-1 overflow-hidden">
			<GraphCanvas />
		</div>
		<div class="flex shrink-0 flex-wrap items-center justify-between gap-4">
			<GraphLegend />

			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					class="border-border bg-panel hover:bg-panel-hover cursor-pointer rounded-md border px-3 py-1.5 text-sm text-gray-300"
					onclick={() => graphStore.clearGraph()}
				>
					Clear graph
				</button>
			</div>
		</div>
	</div>
	<div class="min-h-50 overflow-hidden md:h-full md:min-h-0">
		<NodePanel />
	</div>
</div>
