<script lang="ts">
	import type { GraphNode } from '$lib/graph/types';

	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodeTypeBadge from './NodeTypeBadge.svelte';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodeDetailRow label="Name">{node.displayName}</NodeDetailRow>
	<NodeTypeBadge type={node.type} />

	{#if node.meta?.year}
		<NodeDetailRow label="Year">{node.meta.year}</NodeDetailRow>
	{/if}

	{#if node.meta?.genres?.length}
		<NodeDetailRow label="Genres">{node.meta.genres.join(', ')}</NodeDetailRow>
	{/if}

	{#if node.meta?.styles?.length}
		<NodeDetailRow label="Styles">{node.meta.styles.join(', ')}</NodeDetailRow>
	{/if}

	{#if node.meta?.released}
		<NodeDetailRow label="Released">{node.meta.released}</NodeDetailRow>
	{/if}

	{#if node.meta?.country}
		<NodeDetailRow label="Country">{node.meta.country}</NodeDetailRow>
	{/if}

	{#if node.meta?.format}
		<NodeDetailRow label="Format">{node.meta.format}</NodeDetailRow>
	{/if}
</dl>
