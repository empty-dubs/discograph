<script lang="ts">
	import { seedFromGraphNode } from '../../nexus/bridge';
	import { plugin as source } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NavigationButton from './NavigationButton.svelte';

	import type { EntityType, SearchableListItem } from '../../plugins/discogs';

	interface Props {
		item: SearchableListItem;
		layout?: 'panel' | 'menu';
		onAction?: () => void;
	}

	let { item, layout = 'panel', onAction }: Props = $props();

	const isResetDisabled = $derived(
		!item ||
		!item.externalId ||
		SelectedNodeState.isLoading
	);

	function handleReset() {
		if (isResetDisabled) return;

		seedFromGraphNode({
			id: source.compositions.getEntityId(item.entityType as EntityType, item.externalId as number),
			type: item.entityType as EntityType,
			label: (item.query ?? '').trim() || 'Unknown',
			externalId: item.externalId as number
		});
		onAction?.();
	}
</script>

<div class={layout === 'panel' ? 'flex flex-col gap-2' : ''}>
	{const menuRole = $derived(layout === 'menu' ? 'menuitem' : undefined)}
	{const isBlocked = $derived(source.isBlocked(item.entityType as EntityType, item.externalId as number))}

	<NavigationButton
		{layout}
		role={menuRole}
		disabled={isResetDisabled || isBlocked}
		onclick={handleReset}
	>
		Reset graph to this node
	</NavigationButton>

	{const discogsUrl = $derived(source.compositions.getDiscogsWebsiteUrl(item.entityType as EntityType, item.externalId as number))}

	<NavigationButton
		{layout}
		role={menuRole}
		href={discogsUrl}
		disabled={!discogsUrl || isBlocked}
		onclick={() => onAction?.()}
	>
		View on Discogs
	</NavigationButton>

	{const youtubeUrl = $derived(
		source.compositions.getYouTubeSearchUrl({
			query: item.query,
			entityType: item.entityType as EntityType,
			artist: item.artist,
			year: item.year
		})
	)}
	<NavigationButton
		{layout}
		role={menuRole}
		href={youtubeUrl}
		disabled={!youtubeUrl || isBlocked}
		onclick={() => onAction?.()}
	>
		Search on YouTube
	</NavigationButton>
</div>
