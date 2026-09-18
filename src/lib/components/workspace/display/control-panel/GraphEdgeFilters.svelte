<script lang="ts">
	import { ALL_EDGE_TYPES, EDGE_TYPE_LABELS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';

	import type { EdgeType } from '$lib/graph/types';

	interface Props {
		edgeTypes?: EdgeType[];
	}

	const EDGE_HIGHLIGHT_COLUMNS: EdgeType[][] = [
		['member_of', 'alias_of', 'credited_on'],
		['released', 'on_label', 'version_of'],
		['sublabel_of', 'company_on'],
	];

	let { edgeTypes = ALL_EDGE_TYPES }: Props = $props();

	function isEnabled(type: EdgeType): boolean {
		return !graph.data.isEmpty && graph.display.edgeTypeCounts[type] > 0;
	}

	const columns = $derived(
		edgeTypes === ALL_EDGE_TYPES ? EDGE_HIGHLIGHT_COLUMNS : [edgeTypes]
	);
</script>

<div class="grid grid-cols-3 gap-x-4">
	{#each columns as column (column[0])}
		<div class="flex flex-col">
			{#each column as type (type)}
				{@const highlighted = graph.display.highlightedEdgeType === type}
				{@const activeHighlight = graph.display.highlightedEdgeType !== null}
				{@const count = graph.display.edgeTypeCounts[type]}
				{@const enabled = isEnabled(type)}
				<span
					role="presentation"
					class={enabled ? 'ui-list-item hover:bg-panel' : 'ui-list-item opacity-50'}
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
		</div>
	{/each}
</div>
