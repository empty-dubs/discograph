<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import NodeLoadActions from '$lib/components/workspace/actions/NodeLoadActions.svelte';

	const node = $derived(selectedNodeState);

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
	<NodeLoadActions/>

	{#if node.isDetailsFetched && !node.isBlocked}
		{#if node.hasChildren}
			<button
				type="button"
				class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
				disabled={node.hasLoadingChildren}
				onclick={() => node.collapseNode()}
			>
				Collapse children
			</button>
		{/if}

		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={node.hasLoadingChildren || discogsApi.isRateLimited}
			onclick={() => seedFromNode(graph, node.data!)}
		>
			Reset graph to this node
		</button>
	{/if}
</div>
