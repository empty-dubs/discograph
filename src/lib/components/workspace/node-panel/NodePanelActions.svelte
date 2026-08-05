<script lang="ts">
	import NodeLoadActions from '../NodeLoadActions.svelte';
	import { getDiscogsProxyUrl, getDiscogsWebsiteUrl } from '$lib/discogs/urls';
	import { graphStore } from '$lib/graph/store.svelte';
	import { getPanelExploreActions } from '../menu';
	import { getYouTubeSearchUrl, resolveArtistDisplayName } from '$lib/youtube/urls';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const websiteUrl = $derived(getDiscogsWebsiteUrl(node));
	const apiUrl = $derived(getDiscogsProxyUrl(node));
	const loadActions = $derived(getPanelExploreActions(node));
	const artistDisplayName = $derived(
		node.type === 'release' || node.type === 'master'
			? resolveArtistDisplayName(node, graphStore.linkList, (id) => graphStore.nodes.get(id))
			: null
	);
	const youtubeUrl = $derived(getYouTubeSearchUrl(node, artistDisplayName));

	const actionClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex flex-col gap-2">
	{#if loadActions.length > 0}
		<NodeLoadActions nodeId={node.id} actionsSource="panel" />
	{/if}

	{#if graphStore.hasChildren(node.id)}
		<button
			type="button"
			class="{actionClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
			disabled={graphStore.isLoading(node.id)}
			onclick={() => graphStore.collapseNode(node.id)}
		>
			Collapse children
		</button>
	{/if}

	<button
		type="button"
		class="{actionClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
		disabled={graphStore.isLoading(node.id) || graphStore.isRateLimited}
		onclick={() => graphStore.seedFromNode(node)}
	>
		Reset graph to this node
	</button>

	{#if graphStore.hasMoreReleases(node.id)}
		<button
			type="button"
			class="{actionClass} bg-accent cursor-pointer border-none text-white"
			disabled={graphStore.isLoading(node.id) || graphStore.isRateLimited}
			onclick={() => graphStore.loadMoreReleases(node.id)}
		>
			Load more releases
		</button>
	{/if}

	{#if graphStore.hasMoreMasterReleases(node.id)}
		<button
			type="button"
			class="{actionClass} bg-accent cursor-pointer border-none text-white"
			disabled={graphStore.isLoading(node.id) || graphStore.isRateLimited}
			onclick={() => graphStore.loadMoreMasterReleases(node.id)}
		>
			Load more master releases
		</button>
	{/if}

	{#if websiteUrl}
		<a
			href={websiteUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{actionClass} border-border bg-panel-hover border text-gray-300"
		>
			View on Discogs
		</a>
	{/if}

	{#if youtubeUrl}
		<a
			href={youtubeUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{actionClass} border-border bg-panel-hover border text-gray-300"
		>
			Search on YouTube
		</a>
	{/if}

	{#if apiUrl}
		<a
			href={apiUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="{actionClass} border-border bg-panel-hover border text-sm text-gray-300"
		>
			View Payload
		</a>
	{/if}
</div>
