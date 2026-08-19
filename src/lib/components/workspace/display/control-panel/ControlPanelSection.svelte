<script lang="ts">
	import type { Snippet } from 'svelte';
	import { NODE_COLORS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';
	import type { NodeType } from '$lib/graph/types';

	interface Props {
		title: string;
		nodeTypes?: NodeType[];
		children: Snippet;
	}

	let { title, nodeTypes, children }: Props = $props();

	function sectionNodeType(sectionTitle: string): NodeType | null {
		switch (sectionTitle) {
			case 'Artists':
				return 'artist';
			case 'Labels':
				return 'label';
			default:
				return null;
		}
	}
</script>

<section class="flex min-w-0 flex-col gap-2">
	<div class="flex items-center gap-1.5">
		{#if title === 'Masters/Releases'}
			<span
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				style:background={NODE_COLORS.master}
			></span>
			<span
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				style:background={NODE_COLORS.release}
			></span>
		{:else if sectionNodeType(title)}
			<span
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				style:background={NODE_COLORS[sectionNodeType(title)!]}
			></span>
		{/if}
		<h3 class="text-muted m-0 text-xs font-semibold tracking-wide uppercase">{title}</h3>
		{#each nodeTypes ?? [] as type (type)}
			{@const count = graph.display.typeCounts[type]}
			{#if count > 0}
				<span class="text-xs text-gray-500">{count}</span>
			{/if}
		{/each}
	</div>
	<div class="flex flex-col gap-2 text-sm text-gray-400">
		{@render children()}
	</div>
</section>
