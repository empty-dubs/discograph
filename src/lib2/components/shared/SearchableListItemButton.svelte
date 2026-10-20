<script lang="ts">
	import { discogsPlugin as discogs } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import SearchableListContextMenu from './SearchableListContextMenu.svelte';

	import type { SearchableListItem } from './types';
	import type { GraphNode } from '../../graph/types';

	interface Props {
		item: SearchableListItem;
		class?: string;
	}

	let { item, class: className = '' }: Props = $props();

	let menu = $state<{ x: number; y: number } | null>(null);

	const node = $derived.by((): GraphNode | null => {
		if (!menu || !item.discogsId || !item.searchType) return null;

		return {
			id: discogs.compositions.getEntityId(item.searchType, item.discogsId),
			type: item.searchType,
			label: (item.label ?? item.query ?? '').trim() || 'Unknown',
			externalId: item.discogsId
		};
	});

	function isRowDisabled(item: SearchableListItem): boolean {
		return (
			!item.discogsId ||
			!item.searchType ||
			SelectedNodeState.hasExpansionInFlight ||
			discogs.isBlocked(item.searchType, item.discogsId)
		)

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
	class="ui-list-button flex items-center gap-2 {className}"
	disabled={isRowDisabled(item)}
	aria-haspopup="menu"
	onclick={openMenu}
	oncontextmenu={openMenu}
>
	<span class="min-w-0 truncate">{item.label ?? item.query}</span>
</button>

{#if menu && node}
	<SearchableListContextMenu {node} x={menu.x} y={menu.y} onClose={closeMenu} />
{/if}
