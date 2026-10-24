<script lang="ts">
	import SearchableListItemButton from './SearchableListItemButton.svelte';

	import type { SearchableListItem } from '../../plugins/discogs';

	interface Props {
		items: SearchableListItem[];
	}

	let { items }: Props = $props();
</script>

<div>
	{#each items as item (item.key)}
		<SearchableListItemButton {item} class="border-t border-border" />
	{/each}
</div>
