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

	<dt class="text-muted">Type</dt>
	<NodeTypeBadge type={node.type} />
{:else}
	{#if node.meta?.year}
		<NodeDetailRow label="Year">{node.meta.year}</NodeDetailRow>
	{/if}

	{#if node.meta?.role}
		<NodeDetailRow label="Role">{node.meta.role}</NodeDetailRow>
	{/if}

	{#if node.meta?.genres?.length}
		<NodeDetailRow label="Genres">{node.meta.genres.join(', ')}</NodeDetailRow>
	{/if}
{/if}
