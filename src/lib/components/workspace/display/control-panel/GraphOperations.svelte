<script lang="ts">
	import { graph } from '$lib/graph/stores/graph.svelte';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { seedFromNode } from '$lib/graph/loaders/seed';

	import NodeLoadActions from '../../actions/NodeLoadActions.svelte';
	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const isNodeLoading = $derived(graph.progress.isLoading(node.id));

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
	<NodeLoadActions {node} />

	{#if node && graph.hasChildren(node.id)}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={isNodeLoading}
			onclick={() => graph.collapseNode(node.id)}
		>
			Collapse children
		</button>
	{/if}

	{#if node}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={isNodeLoading || discogsApi.isRateLimited}
			onclick={() => seedFromNode(graph, node)}
		>
			Reset graph to this node
		</button>
	{/if}
</div>
