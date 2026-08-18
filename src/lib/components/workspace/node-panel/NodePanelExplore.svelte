<script lang="ts">
	import {
		getDiscogsProxyUrl,
		getDiscogsWebsiteUrl,
		getYouTubeSearchUrl,
		resolveArtistDisplayName
	} from '$lib/components/workspace/actions/compositions';
	import { graph } from '$lib/graph/graph';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const node = $derived(selectedNodeState.data);

	const websiteUrl = $derived(getDiscogsWebsiteUrl(node!));
	const apiUrl = $derived(getDiscogsProxyUrl(node!));
	const artistDisplayName = $derived(
		node!.type === 'release' || node!.type === 'master'
			? resolveArtistDisplayName(node!, graph.data.linkList, (id) => graph.data.nodes.get(id))
			: null
	);
	const youtubeUrl = $derived(getYouTubeSearchUrl(node!, artistDisplayName));

	const linkClass =
		'border-border bg-panel-hover cursor-pointer text-center rounded-md border px-3 py-2 text-sm text-gray-300 no-underline';
</script>

<div class="flex flex-col gap-2">
	{#if websiteUrl}
		<a
			href={websiteUrl}
			target="_blank"
			rel="noopener noreferrer"
			class={linkClass}
		>
			View on Discogs
		</a>
	{/if}

	{#if youtubeUrl}
		<a
			href={youtubeUrl}
			target="_blank"
			rel="noopener noreferrer"
			class={linkClass}
		>
			Search on YouTube
		</a>
	{/if}

	{#if apiUrl}
		<a
			href={apiUrl}
			target="_blank"
			rel="noopener noreferrer"
			class={linkClass}
		>
			View Payload
		</a>
	{/if}
</div>
