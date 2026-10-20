<script lang="ts">
	import { seedFromGraphNode } from '../../nexus/bridge';
	import { discogsPlugin as discogs } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NavigationButton from './NavigationButton.svelte';

	import type { GraphNode } from '../../graph/types';
	import type { SearchType } from '../../plugins/discogs';

	interface Props {
		node: GraphNode;
		layout?: 'panel' | 'menu';
		onAction?: () => void;
	}

	let { node, layout = 'panel', onAction }: Props = $props();

	const isResetDisabled = $derived(
		!node ||
		!node.externalId ||
		discogs.isBlocked(node.type as SearchType, node.externalId) ||
		SelectedNodeState.hasExpansionInFlight
	);

	const discogsUrl = $derived(discogs.compositions.getDiscogsWebsiteUrl(node.type as SearchType, node.externalId));

	const youtubeUrl = $derived(
		discogs.compositions.getYouTubeSearchUrl({
			label: node.label,
			query: node.label,
			searchType: node.type as SearchType
		})
	);

	const menuRole = $derived(layout === 'menu' ? 'menuitem' : undefined);

	function handleReset() {
		if (isResetDisabled) return;

		seedFromGraphNode(node);
		onAction?.();
	}
</script>

<div class={layout === 'panel' ? 'flex flex-col gap-2' : ''}>
	<NavigationButton
		{layout}
		role={menuRole}
		disabled={isResetDisabled}
		onclick={handleReset}
	>
		Reset graph to this node
	</NavigationButton>

	<NavigationButton
		{layout}
		role={menuRole}
		href={discogsUrl}
		disabled={!discogsUrl}
		onclick={() => onAction?.()}
	>
		View on Discogs
	</NavigationButton>

	<NavigationButton
		{layout}
		role={menuRole}
		href={youtubeUrl}
		disabled={!youtubeUrl}
		onclick={() => onAction?.()}
	>
		Search on YouTube
	</NavigationButton>
</div>
