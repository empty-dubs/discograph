<script lang="ts">
	import NodeDetailRow from './NodeDetailRow.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();
</script>

{#if node.parent_label}
	<NodeDetailRow label="Parent label">{node.parent_label.name}</NodeDetailRow>
{/if}

{#if node.sublabels?.length}
	<NodeDetailRow label="Sublabels">
		{node.sublabels.map((sublabel) => sublabel.name).join(', ')}
	</NodeDetailRow>
{/if}
