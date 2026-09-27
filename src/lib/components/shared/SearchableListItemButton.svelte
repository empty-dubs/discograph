<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { ALL_NODE_TYPES } from '$lib/graph/constants';
	import { getNodeId } from '$lib/graph/operations/patches/compositions';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

	import NodeTypePill from '$lib/components/shared/NodeTypePill.svelte';
	import SearchableListContextMenu from '../workspace/control-panel/SearchableListContextMenu.svelte';

	import type { SearchableListItem } from './types';

	interface Props {
		item: SearchableListItem;
		class?: string;
		hasPill?: boolean;
	}

	let { item, class: className = '', hasPill = true }: Props = $props();

	let menu = $state<{ x: number; y: number } | null>(null);

	const node = $derived.by(() => {
		if (menu && item.discogsId && item.searchType) {
			return {
				id: getNodeId(item.searchType, item.discogsId),
				type: item.searchType,
				discogsId: item.discogsId,
				displayName: (item.query ?? '').trim() || 'Unknown',
				artists: item.artists,
				meta: item.meta
			};
		}

		return null;
	});

	function isRowDisabled(item: SearchableListItem): boolean {
		return (
			!item.discogsId
			|| !item.searchType
			|| discogsApi.isRateLimited
			|| crawlState.isRunning
			|| discogsApi.isBlockedDiscogsEntity(item.searchType!, item.discogsId!)
		);
	}

	function openMenu(event: MouseEvent) {
		if (isRowDisabled(item)) return;

		event.preventDefault();

		menu = { x: event.clientX, y: event.clientY };
	}

	function closeMenu() {
		menu = null;
	}
</script>

<button
	type="button"
	class="ui-list-button flex items-center gap-2 px-0 py-0.5 {className}"
	disabled={isRowDisabled(item)}
	aria-haspopup="menu"
	onclick={openMenu}
	oncontextmenu={openMenu}
>
	{#if hasPill && item.searchType && ALL_NODE_TYPES.includes(item.searchType)}
		<NodeTypePill type={item.searchType} />
	{/if}
	<span class="min-w-0 truncate">{item.label}</span>
</button>

{#if menu && node}
	<SearchableListContextMenu {node} x={menu.x} y={menu.y} onClose={closeMenu} />
{/if}
