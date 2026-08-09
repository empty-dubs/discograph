<script lang="ts">
	import { getDiscogsProxyUrl, getDiscogsWebsiteUrl } from '$lib/discogs/urls';
	import { graph } from '$lib/graph/store/graph.svelte';
	import { discogsApiStore } from '$lib/discogs/api-store.svelte';
	import { loadMoreMasterReleases, loadMoreReleases } from '$lib/graph/actions/releases';
	import { getYouTubeSearchUrl, resolveArtistDisplayName } from '$lib/youtube/urls';

	import type { GraphNode } from '$lib/graph/types';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';
	import { LOAD_ACTIONS } from '../actions/constants';


	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const websiteUrl = $derived(getDiscogsWebsiteUrl(node));
	const apiUrl = $derived(getDiscogsProxyUrl(node));
	const loadActions = $derived(LOAD_ACTIONS[node.type]);
	const artistDisplayName = $derived(
		node.type === 'release' || node.type === 'master'
			? resolveArtistDisplayName(node, graph.linkList, (id) => graph.nodes.get(id))
			: null
	);
	const youtubeUrl = $derived(getYouTubeSearchUrl(node, artistDisplayName));

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-col gap-2">
	{#if loadActions.length > 0}
		<NodeLoadActions nodeId={node.id} />
	{/if}

	{#if graph.hasChildren(node.id)}
		<button
			type="button"
			class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={graph.isLoading(node.id)}
			onclick={() => graph.collapseNode(node.id)}
		>
			Collapse children
		</button>
	{/if}

	<button
		type="button"
		class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
		disabled={graph.isLoading(node.id) || discogsApiStore.isRateLimited}
		onclick={() => graph.seedFromNode(node)}
	>
		Reset graph to this node
	</button>

	{#if graph.hasMoreReleases(node.id)}
		<button
			type="button"
			class="{buttonClass} bg-accent cursor-pointer border-none text-white"
			disabled={graph.isLoading(node.id) || discogsApiStore.isRateLimited}
			onclick={() => loadMoreReleases(graph, node.id)}
		>
			Load more releases
		</button>
	{/if}

	{#if graph.hasMoreMasterReleases(node.id)}
		<button
			type="button"
			class="{buttonClass} bg-accent cursor-pointer border-none text-white"
			disabled={graph.isLoading(node.id) || discogsApiStore.isRateLimited}
			onclick={() => loadMoreMasterReleases(graph, node.id)}
		>
			Load more master releases
		</button>
	{/if}

	{#if websiteUrl}
		<a
			href={websiteUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{buttonClass} border-border bg-panel-hover border text-gray-300"
		>
			View on Discogs
		</a>
	{/if}

	{#if youtubeUrl}
		<a
			href={youtubeUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{buttonClass} border-border bg-panel-hover border text-gray-300"
		>
			Search on YouTube
		</a>
	{/if}

	{#if apiUrl}
		<a
			href={apiUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{buttonClass} border-border bg-panel-hover border text-sm text-gray-300"
		>
			View Payload
		</a>
	{/if}
</div>
