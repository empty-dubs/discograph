<script lang="ts">
	import GraphLegend from '$lib/components/GraphLegend.svelte';

	import { graphStore } from '$lib/graph/store.svelte';
</script>

<footer class="flex flex-wrap items-center justify-between gap-4">
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
</footer>