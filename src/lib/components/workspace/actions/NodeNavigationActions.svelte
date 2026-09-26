<script lang="ts">
	import { isDev } from '$lib/app/dev';

	import {
		getDiscogsProxyUrl,
		getDiscogsWebsiteUrl,
		getYouTubeSearchUrl
	} from '$lib/components/workspace/actions/compositions';
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';

	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { graph } from '$lib/graph/graph';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
		layout?: 'panel' | 'menu';
		onAction?: () => void;
	}

	let { node, layout = 'panel', onAction }: Props = $props();

	const isResetDisabled = $derived.by(() => {
		selectedNodeState.id;
		return (
			!node
			|| node.discogsId === null
			|| discogsApi.isRateLimited
			|| discogsApi.isBlockedDiscogsEntity(node.type, node.discogsId)
			|| crawlState.isRunning
			|| selectedNodeState.hasLoadingChildren
			|| !selectedNodeState.isDetailsFetched
		);
	});

	const discogsWebsiteUrl = $derived(node ? getDiscogsWebsiteUrl(node) : null);
	const youtubeUrl = $derived(node ? getYouTubeSearchUrl(node) : null);
	const discogsApiUrl = $derived(node ? getDiscogsProxyUrl(node) : null);

	const externalActions = $derived([
		{ label: 'View on Discogs', url: discogsWebsiteUrl },
		{ label: 'Search on YouTube', url: youtubeUrl },
		...(
			isDev && discogsApiUrl
			? [{ label: 'View Payload', url: discogsApiUrl }]
			: []
		)
	]);

	function handleReset() {
		if (isResetDisabled || !node) return;

		seedFromNode(graph, node);
		onAction?.();
	}

	const layoutClass = $derived(layout === 'menu' ? 'ui-list-button' : 'ui-explore-link');
	const disabledClass = $derived(isResetDisabled ? 'opacity-50 cursor-not-allowed' : '');
</script>

<div class={layout === 'panel' ? 'flex flex-col gap-2' : ''}>
	<button
		type="button"
			role={layout === 'menu' ? 'menuitem' : undefined}
			class="{layoutClass} {disabledClass}"
			disabled={isResetDisabled}
			onclick={handleReset}
		>
		Reset graph to this node
	</button>

	{#each externalActions as action (action.label)}
		{#if node && action.url}
			<a
				href={action.url}
				target="_blank"
				rel="noopener noreferrer"
				role={layout === 'menu' ? 'menuitem' : undefined}
				class="{layoutClass} block"
				onclick={() => onAction?.()}
			>
				{action.label}
			</a>
		{:else}
			<button
				type="button"
				role={layout === 'menu' ? 'menuitem' : undefined}
				disabled
				class="{layoutClass} {disabledClass}"
			>
				{action.label}
			</button>
		{/if}
	{/each}
</div>
