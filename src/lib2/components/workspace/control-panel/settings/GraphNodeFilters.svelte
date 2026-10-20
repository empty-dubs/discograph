<script lang="ts">
	import { graph } from '../../../../graph/graph';
	import { discogsPlugin as discogs } from '../../../../plugins/discogs';
</script>

<div class="flex flex-col">
	{#each discogs.presentation.entities as entity (entity.type)}
		{const visible = graph.presentation.isNodeTypeVisible(entity.type)}
		{const count = $derived(graph.presentation.nodeTypeCounts[entity.type] ?? 0)}
		<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
			<input
				type="checkbox"
				class="accent-accent size-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
				checked={visible}
				disabled={graph.data.isEmpty || count === 0}
				onchange={(e) => graph.presentation.toggleNodeTypeVisibility(entity.type, e.currentTarget.checked)}
			/>
			Show {entity.group}
		</label>
	{/each}
</div>
