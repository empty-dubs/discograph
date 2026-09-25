<script lang="ts">
	import {
		getDiscogsProxyUrl,
		getDiscogsWebsiteUrl,
		getYouTubeSearchUrl,
	} from '$lib/components/workspace/actions/compositions';
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';
	import { isDev } from '$lib/app/dev';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const node = $derived(selectedNodeState);

	const websiteUrl = $derived(node.data ? getDiscogsWebsiteUrl(node.data) : null);
	const apiUrl = $derived(node.data ? getDiscogsProxyUrl(node.data) : null);
	const youtubeUrl = $derived(node.data ? getYouTubeSearchUrl(node.data) : null);

	const resetDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.data
		|| node.hasLoadingChildren
		|| discogsApi.isRateLimited
		|| crawlState.isRunning
	);

	$inspect('resetDisabled', resetDisabled);
	// $inspect('isDetailsFetched', node.isDetailsFetched);
	// $inspect('isBlocked', node.isBlocked);
	// $inspect('data', node.data);
	// $inspect('hasLoadingChildren', node.hasLoadingChildren);
	// $inspect('discogsApi.isRateLimited', discogsApi.isRateLimited);
	// $inspect('crawlState.isRunning', crawlState.isRunning);


	const actions = $derived([
		{ label: 'View on Discogs', url: websiteUrl },
		{ label: 'Search on YouTube', url: youtubeUrl },
		...(isDev && apiUrl ? [{ label: 'View Payload', url: apiUrl }] : [])
	]);
</script>

<div class="border-border/50 mt-3 shrink-0 border-t pt-3">
	<div class="flex flex-col gap-2">
		{#if node.id}
			<button
				type="button"
				class="ui-explore-link {resetDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
				disabled={resetDisabled}
				onclick={() => seedFromNode(graph, node.data!)}
			>
				Reset graph to this node
			</button>
		{:else}
			<button type="button" disabled class="ui-explore-link cursor-not-allowed opacity-50">
				Reset graph to this node
			</button>
		{/if}

		{#each actions as action (action.label)}
			{#if node.id && action.url}
				<a
					href={action.url}
					target="_blank"
					rel="noopener noreferrer"
					class="ui-explore-link"
				>
					{action.label}
				</a>
			{:else}
				<button type="button" disabled class="ui-explore-link cursor-not-allowed opacity-50">
					{action.label}
				</button>
			{/if}
		{/each}
	</div>
</div>
