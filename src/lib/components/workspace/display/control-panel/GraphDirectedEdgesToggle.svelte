<script lang="ts">
	import { graph } from '$lib/graph/graph';
</script>

<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
	<input
		type="checkbox"
		class="accent-accent size-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
		checked={graph.display.showDirectedEdges}
		disabled={graph.data.linkList.length === 0}
		onchange={(e) => {
			graph.display.showDirectedEdges = e.currentTarget.checked;
		}}
	/>
	Show directed edges
</label>
