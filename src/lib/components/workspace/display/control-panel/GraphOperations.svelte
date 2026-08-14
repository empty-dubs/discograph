<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { seedFromNode } from '$lib/graph/loaders/seed';

	import NodeLoadActions from '../../actions/NodeLoadActions.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const node = $derived(selectedNodeState);

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
	<NodeLoadActions/>

	{#if node.id && node.hasChildren}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={node.isLoading}
			onclick={() => node.collapseNode()}
		>
			Collapse children
		</button>
	{/if}

	{#if node.id}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={node.isLoading || discogsApi.isRateLimited}
			onclick={() => seedFromNode(graph, node.node!)}
		>
			Reset graph to this node
		</button>
	{/if}
</div>
