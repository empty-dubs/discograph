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

	import NodeNavigationButton from '$lib/components/workspace/actions/NodeNavigationButton.svelte';

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

	const menuRole = $derived(layout === 'menu' ? 'menuitem' : undefined);

	function handleReset() {
		if (isResetDisabled || !node) return;

		seedFromNode(graph, node);
		onAction?.();
	}
</script>

<div class={layout === 'panel' ? 'flex flex-col gap-2' : ''}>
	<NodeNavigationButton
		{layout}
		role={menuRole}
		disabled={isResetDisabled}
		onclick={handleReset}
	>
		Reset graph to this node
	</NodeNavigationButton>

	{#each externalActions as action (action.label)}
		<NodeNavigationButton
			{layout}
			role={menuRole}
			href={node && action.url ? action.url : undefined}
			disabled={!node || !action.url}
			onclick={() => onAction?.()}
		>
			{action.label}
		</NodeNavigationButton>
	{/each}
</div>
