<script lang="ts">
	import { stripDiscogsWikiMarkup } from '$lib/discogs/format';
	import { graphStore } from '$lib/graph/store.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const profileText = $derived(
		(node.type === 'artist' || node.type === 'label') && node.profile
			? stripDiscogsWikiMarkup(node.profile)
			: null
	);
</script>

{#if node.type === 'artist' && graphStore.isArtistDetailsLoading(node.id)}
	<p class="text-muted mt-2 text-sm">Loading artist details…</p>
{/if}

{#if node.type === 'label' && graphStore.isLabelDetailsLoading(node.id)}
	<p class="text-muted mt-2 text-sm">Loading label details…</p>
{/if}

{#if profileText}
	<div class="text-muted mt-3 whitespace-pre-wrap text-sm">{profileText}</div>
{/if}
