<script lang="ts">
	import { ALL_EDGE_TYPES, EDGE_TYPE_LABELS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';

	import type { EdgeType } from '$lib/graph/types';

	interface Props {
		edgeTypes?: EdgeType[];
	}

	let { edgeTypes = ALL_EDGE_TYPES }: Props = $props();

	const itemClass =
		'flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-panel cursor-default';
	const disabledClass = 'flex items-center gap-1.5 rounded px-1.5 py-0.5 opacity-50 cursor-default';

	function isEnabled(type: EdgeType): boolean {
		return !graph.data.isEmpty && graph.display.edgeTypeCounts[type] > 0;
	}
</script>

{#each edgeTypes as type (type)}
	{@const highlighted = graph.display.highlightedEdgeType === type}
	{@const activeHighlight = graph.display.highlightedEdgeType !== null}
	{@const count = graph.display.edgeTypeCounts[type]}
	{@const enabled = isEnabled(type)}
	<span
		role="presentation"
		class={enabled ? itemClass : disabledClass}
		onmouseenter={() => {
			if (enabled) graph.display.selectEdgeType(type);
		}}
		onmouseleave={() => {
			if (enabled) graph.display.clearEdgeHighlight();
		}}
	>
		<span class:opacity-45={activeHighlight && !highlighted}>{EDGE_TYPE_LABELS[type]}</span>

		{#if count > 0}
			<span class="text-xs text-gray-500">{count}</span>
		{/if}
	</span>
{/each}
