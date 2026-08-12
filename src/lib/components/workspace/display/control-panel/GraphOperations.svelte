<script lang="ts">
	import { graph } from '$lib/graph/stores/graph.svelte';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { seedFromNode } from '$lib/graph/loaders/seed';

	import NodeLoadActions from '../../actions/NodeLoadActions.svelte';

	interface Props {
		nodeId: string;
	}

	let { nodeId }: Props = $props();

	const selectedNode = $derived(graph.nodes.get(nodeId) ?? null);
	const isNodeLoading = $derived(graph.progress.isLoading(nodeId));

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
	<NodeLoadActions {nodeId} />

	{#if selectedNode && graph.hasChildren(nodeId)}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={isNodeLoading}
			onclick={() => graph.collapseNode(nodeId)}
		>
			Collapse children
		</button>
	{/if}

	{#if selectedNode}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={isNodeLoading || discogsApi.isRateLimited}
			onclick={() => seedFromNode(graph, selectedNode)}
		>
			Reset graph to this node
		</button>
	{/if}
</div>
