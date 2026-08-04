<script lang="ts">
	import { graphStore } from '$lib/graph/store.svelte';
	import { ALL_NODE_TYPES, NODE_COLORS } from '$lib/graph/constants';
	import type { NodeType } from '$lib/graph/types';

	const labels: Record<NodeType, string> = {
		artist: 'Artists',
		label: 'Labels',
		master: 'Masters',
		release: 'Releases'
	};
</script>

<div
	class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400"
	role="group"
	aria-label="Node type visibility"
>
	{#each ALL_NODE_TYPES as type (type)}
		{@const visible = graphStore.isTypeVisible(type)}
		{@const count = graphStore.typeCounts[type]}
		<button
			type="button"
			class="font-inherit hover:bg-panel flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-1.5 py-0.5 text-inherit"
			aria-pressed={visible}
			onclick={() => graphStore.toggleType(type)}
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
</div>
