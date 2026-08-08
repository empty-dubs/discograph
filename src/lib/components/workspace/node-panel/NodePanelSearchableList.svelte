<script lang="ts">
	import { discogsApiStore } from '$lib/discogs/api-store.svelte';

	import type { SearchType } from '$lib/discogs/types';

	interface Item {
		key: string;
		label?: string;
		query?: string;
	}

	interface Props {
		items: Item[];
		searchType?: SearchType | '';
	}

	let { items, searchType = '' }: Props = $props();
</script>

<div class="space-y-1">
	{#each items as { key, label, query } (key)}
		<button
			type="button"
			class="hover:bg-panel-hover block w-full rounded border-none bg-transparent px-0 py-0.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
			disabled={discogsApiStore.searching || discogsApiStore.isRateLimited}
			onclick={() => discogsApiStore.search(query ?? '', searchType || undefined)}
		>
			{label}
		</button>
	{/each}
</div>
