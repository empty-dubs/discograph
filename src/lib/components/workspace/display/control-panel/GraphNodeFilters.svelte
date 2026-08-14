<script lang="ts">
	import { ALL_NODE_TYPES, NODE_COLORS, NODE_TYPE_LABELS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';
</script>

{#each ALL_NODE_TYPES as type (type)}
	{@const visible = graph.display.isTypeVisible(type)}
	{@const count = graph.display.typeCounts[type]}
	<button
		type="button"
		class="font-inherit hover:bg-panel flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-1.5 py-0.5 text-inherit disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
		aria-pressed={visible}
		disabled={graph.data.isEmpty}
		onclick={() => graph.display.toggleType(type)}
	>
		<span
			class="h-2.5 w-2.5 shrink-0 rounded-full"
			style:background={NODE_COLORS[type]}
			style:opacity={visible ? 1 : 0.3}
		></span>

		<span class:line-through={!visible} class:opacity-45={!visible}>{NODE_TYPE_LABELS[type]}</span>

		{#if count > 0}
			<span class="text-xs text-gray-500">{count}</span>
		{/if}
	</button>
{/each}
