<script lang="ts">
	import SearchableListItemButton from '$lib/components/shared/SearchableListItemButton.svelte';

	import type { SearchableListItem } from '$lib/components/shared/types';

	interface Props {
		items: SearchableListItem[];
	}

	let { items }: Props = $props();
</script>

<div>
	{#each items as item (item.key)}
		<SearchableListItemButton {item} class={"border-t border-border"}/>
	{/each}
</div>
