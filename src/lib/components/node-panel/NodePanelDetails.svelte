<script lang="ts">
	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodePanelArtistDetails from './NodePanelArtistDetails.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';
	import NodePanelLabelDetails from './NodePanelLabelDetails.svelte';
	import NodePanelUrls from './NodePanelUrls.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodePanelCommonDetails {node} />

	{#if node.type === 'artist'}
		<NodePanelArtistDetails {node} />
	{/if}

	{#if node.type === 'label'}
		<NodePanelLabelDetails {node} />
	{/if}

	<NodePanelUrls {node} />

	{#if node.discogsId}
		<NodeDetailRow label="Discogs ID">{node.discogsId}</NodeDetailRow>
	{/if}
</dl>
