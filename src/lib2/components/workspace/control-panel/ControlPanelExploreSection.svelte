<script lang="ts">
	import type { Snippet } from 'svelte';

	import { graph } from '../../../graph/graph';
	import { defaultNodePresentation } from '../../../graph/presentation';
	import { discogsPlugin as discogs } from '../../../plugins/discogs';

	interface Props {
		title: string;
		nodeTypes?: readonly string[];
		children: Snippet;
	}

	let { title, nodeTypes, children }: Props = $props();

	function entityColor(type: string): string {
		return discogs.presentation.entities.find((entity) => entity.type === type)?.color
				?? defaultNodePresentation.color;
	}
</script>

<section class="flex min-w-0 flex-col gap-2">
	<div class="flex items-center gap-1.5">
		<!-- node type indicators -->
		{#if title === 'Masters/Releases'}
			<span
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				style:background={entityColor('master')}
			></span>
			<span
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				style:background={entityColor('release')}
			></span>
		{:else if title === 'Artists'}
			<span class="h-2.5 w-2.5 shrink-0 rounded-full" style:background={entityColor('artist')}></span>
		{:else if title === 'Labels'}
			<span class="h-2.5 w-2.5 shrink-0 rounded-full" style:background={entityColor('label')}></span>
		{/if}
		<!-- section title -->
		<h3 class="ui-label">{title}</h3>
		<!-- node type counts -->
		{#each nodeTypes ?? [] as type (type)}
			{const count = $derived(graph.presentation.nodeTypeCounts[type] ?? 0)}
			{#if count > 0}
				<span class="text-sm text-gray-500">{count}</span>
			{/if}
		{/each}
	</div>
	<div class="flex flex-col gap-2 text-sm text-gray-400">
		{@render children()}
	</div>
</section>
