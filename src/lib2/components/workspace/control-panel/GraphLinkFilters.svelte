<script lang="ts">
	import { graph } from '../../../graph/graph';
	import { discogsPlugin as discogs } from '../../../plugins/discogs';

	const RELATIONSHIP_HIGHLIGHT_COLUMNS: string[][] = [
		['member_of', 'alias_of', 'credited_on'],
		['released', 'on_label', 'version_of'],
		['sublabel_of', 'company_on']
	];

	const labels = Object.fromEntries(
		discogs.presentation.relationships.map((relationship) => [relationship.type, relationship.label])
	) as Record<string, string>;

	function isEnabled(type: string): boolean {
		return !graph.data.isEmpty && (graph.presentation.linkTypeCounts[type] ?? 0) > 0;
	}
</script>

<div class="grid grid-cols-3 gap-x-4">
	{#each RELATIONSHIP_HIGHLIGHT_COLUMNS as column}
		<div class="flex flex-col">
			{#each column as type}
				{const highlighted = $derived(graph.presentation.highlightedLinkType === type)}
				{const active = $derived(graph.presentation.highlightedLinkType !== null)}
				{const count = $derived(graph.presentation.linkTypeCounts[type] ?? 0)}
				{const enabled = $derived(isEnabled(type))}
				<span
					role="presentation"
					class="ui-list-item {enabled ? 'hover:bg-panel' : 'cursor-not-allowed opacity-50'}"
					onmouseenter={() => {
						if (enabled) graph.presentation.setHighlightedLinkType(type);
					}}
					onmouseleave={() => {
						if (enabled) graph.presentation.clearHighlightedLinkType();
					}}
				>
					<span class:opacity-45={active && !highlighted}>
						{labels[type] ?? type}
					</span>

					{#if count > 0}
						<span class="text-sm text-gray-500">{count}</span>
					{/if}
				</span>
			{/each}
		</div>
	{/each}
</div>
