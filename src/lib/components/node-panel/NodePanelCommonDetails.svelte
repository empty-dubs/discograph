<script lang="ts">
	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodeTypeBadge from './NodeTypeBadge.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
		variant?: 'header' | 'meta';
	}

	let { node, variant = 'header' }: Props = $props();
</script>

{#if variant === 'header'}
	<NodeDetailRow label="Name">{node.displayName}</NodeDetailRow>
	<NodeTypeBadge type={node.type} />
{:else}
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
{/if}
