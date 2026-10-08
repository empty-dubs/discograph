<script lang="ts">
	import { graph } from '../../../graph/graph';
</script>

<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
	<input
		type="checkbox"
		class="accent-accent size-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
		checked={graph.presentation.showNodeLabels}
		disabled={graph.data.isEmpty}
		onchange={(e) => {
			graph.presentation.showNodeLabels = e.currentTarget.checked;
		}}
	/>
	Show node labels
</label>
