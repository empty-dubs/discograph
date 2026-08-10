<script lang="ts">
	import { ALL_NODE_TYPES, NODE_COLORS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/store/graph.svelte';
	import { discogsApiStore } from '$lib/discogs/api-store.svelte';

	import { seedFromNode } from '$lib/graph/loaders/seed';

	import type { NodeType } from '$lib/graph/types';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';

	const labels: Record<NodeType, string> = {
		artist: 'Artists',
		label: 'Labels',
		master: 'Masters',
		release: 'Releases'
	};

	const selectedNode = $derived(graph.selectedNode);

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-col gap-3">
	<div
		class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400"
		role="group"
		aria-label="Node type visibility"
	>
		{#each ALL_NODE_TYPES as type (type)}
			{@const visible = graph.isTypeVisible(type)}
			{@const count = graph.typeCounts[type]}
			<button
				type="button"
				class="font-inherit hover:bg-panel flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-1.5 py-0.5 text-inherit disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
				aria-pressed={visible}
				disabled={graph.isEmpty}
				onclick={() => graph.toggleType(type)}
			>
				<span
					class="h-2.5 w-2.5 shrink-0 rounded-full"
					style:background={NODE_COLORS[type]}
					style:opacity={visible ? 1 : 0.3}
				></span>

				<span class:line-through={!visible} class:opacity-45={!visible}>{labels[type]}</span>

				{#if count > 0}
					<span class="text-xs text-gray-500">{count}</span>
				{/if}
			</button>
		{/each}

		{#if !graph.isEmpty}
			<button
				type="button"
				class="font-inherit hover:bg-panel flex cursor-pointer items-center rounded border-none bg-transparent px-1.5 py-0.5 text-inherit disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
				aria-pressed={graph.showNodeLabels}
				onclick={() => graph.toggleNodeLabels()}
			>
				{graph.showNodeLabels ? 'Hide labels' : 'Show labels'}
			</button>

			<button
				type="button"
				class="border-border bg-panel hover:bg-panel-hover cursor-pointer rounded-md border px-3 py-1.5 text-sm text-gray-300"
				onclick={() => {
					graph.clear();
					discogsApiStore.clear();
				}}
			>
				Clear graph
			</button>
		{/if}
	</div>

	{#if selectedNode}
		<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
			<NodeLoadActions nodeId={selectedNode.id} />

			{#if graph.hasChildren(selectedNode.id)}
				<button
					type="button"
					class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
					disabled={graph.isLoading(selectedNode.id)}
					onclick={() => graph.collapseNode(selectedNode.id)}
				>
					Collapse children
				</button>
			{/if}

			<button
				type="button"
				class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
				disabled={graph.isLoading(selectedNode.id) || discogsApiStore.isRateLimited}
				onclick={() => { seedFromNode(graph, selectedNode) }}
			>
				Reset graph to this node
			</button>
		</div>
	{/if}
</div>
