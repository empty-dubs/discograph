<script lang="ts">
	import { seedFromGraphNode } from '../../nexus/bridge';
	import { plugin as source } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NavigationButton from './NavigationButton.svelte';

	import type { GraphNode } from '../../graph/types';
	import type { EntityType } from '../../plugins/discogs';

	interface Props {
		node: GraphNode;
		layout?: 'panel' | 'menu';
		onAction?: () => void;
	}

	let { node, layout = 'panel', onAction }: Props = $props();

	const isResetDisabled = $derived(
		!node ||
		!node.externalId ||
		source.isBlocked(node.type as EntityType, node.externalId) ||
		SelectedNodeState.isLoading
	);

	const discogsUrl = $derived(source.compositions.getDiscogsWebsiteUrl(node.type as EntityType, node.externalId));

	const youtubeUrl = $derived(
		source.compositions.getYouTubeSearchUrl({
			label: node.label,
			query: node.label,
			entityType: node.type as EntityType
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
