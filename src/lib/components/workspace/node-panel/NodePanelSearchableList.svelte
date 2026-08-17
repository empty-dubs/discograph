<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import type { SearchType } from '$lib/discogs/types';

	interface Item {
		key: string;
		label?: string;
		query?: string;
		discogsId?: number;
	}

	interface Props {
		items: Item[];
		searchType?: SearchType | '';
	}

	let { items, searchType = '' }: Props = $props();

	function isSearchable(item: Item): boolean {
		if (searchType !== 'artist' && searchType !== 'label') return true;
		if (item.discogsId == null) return true;

		return !discogsApi.isBlockedDiscogsEntity(searchType, item.discogsId);
	}
</script>

<div class="space-y-1">
	{#each items as item (item.key)}
		{#if isSearchable(item)}
			<button
				type="button"
				class="hover:bg-panel-hover block w-full rounded border-none bg-transparent px-0 py-0.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
				disabled={discogsApi.searching || discogsApi.isRateLimited}
				onclick={() => discogsApi.search(item.query ?? '', searchType || undefined)}
			>
				{item.label}
			</button>
		{:else}
			<span class="block px-0 py-0.5 text-sm">{item.label}</span>
		{/if}
	{/each}
</div>
