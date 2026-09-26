<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { ALL_NODE_TYPES } from '$lib/graph/constants';
	import { getNodeId } from '$lib/graph/operations/patches/compositions';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

	import NodeTypePill from '$lib/components/shared/NodeTypePill.svelte';
	import SearchableListContextMenu from './SearchableListContextMenu.svelte';

	import type { SearchType } from '$lib/discogs/types';

	type SearchableListItem = {
		key: string;
		label?: string;
		query?: string;
		discogsId?: number;
		searchType?: SearchType;
		artists?: { id: number; name: string }[];
		meta?: { year?: number | string; genres?: string[]; styles?: string[] };
	};

	interface Props {
		items: SearchableListItem[];
	}

	let { items }: Props = $props();

	let menu = $state<{ item: SearchableListItem; x: number; y: number } | null>(null);

	const node = $derived.by(() => {
		if (menu && menu.item.discogsId && menu.item.searchType) {
			return {
				id: getNodeId(menu.item.searchType, menu.item.discogsId),
				type: menu.item.searchType,
				discogsId: menu.item.discogsId,
				displayName: (menu.item.query ?? '').trim() || 'Unknown',
				artists: menu.item.artists,
				meta: menu.item.meta,
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

	function openMenu(item: SearchableListItem, event: MouseEvent) {
		if (isRowDisabled(item)) return;

		event.preventDefault();
		menu = { item, x: event.clientX, y: event.clientY };
	}

	function closeMenu() {
		menu = null;
	}
</script>

<div class="space-y-1">
	{#each items as item (item.key)}
		<button
			type="button"
			class="ui-list-button flex items-center gap-2 border-t border-border px-0 py-0.5"
			disabled={isRowDisabled(item)}
			aria-haspopup="menu"
			onclick={(event) => openMenu(item, event)}
			oncontextmenu={(event) => openMenu(item, event)}
		>
			{#if item.searchType && ALL_NODE_TYPES.includes(item.searchType)}
				<NodeTypePill type={item.searchType} />
			{/if}
			<span class="min-w-0 truncate">{item.label}</span>
		</button>
	{/each}
</div>

{#if menu && node}
	<SearchableListContextMenu {node} x={menu.x} y={menu.y} onClose={closeMenu} />
{/if}
