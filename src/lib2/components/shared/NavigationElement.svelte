<script lang="ts">
	import { plugin as source } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NavigationElementContextMenu from './NavigationElementContextMenu.svelte';

	import type { NavigationPayload } from '../../plugins/discogs';

	interface Props {
		item: NavigationPayload;
		class?: string;
	}

	let { item, class: className = '' }: Props = $props();

	let menu = $state<{ x: number; y: number } | null>(null);

	function isDisabled(item: NavigationPayload): boolean {
		return (
			!item.externalId ||
			!item.entityType ||
			SelectedNodeState.isLoading ||
			source.fetch.isBlocked(item.entityType, item.externalId)
		)

	}

	function openMenu(event: MouseEvent) {
		if (isDisabled(item)) return;

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
	disabled={isDisabled(item)}
	aria-haspopup="menu"
	onclick={openMenu}
	oncontextmenu={openMenu}
>
	<span class="min-w-0 truncate">{item.label}</span>
</button>

{#if menu}
	<NavigationElementContextMenu {item} x={menu.x} y={menu.y} onClose={closeMenu} />
{/if}
