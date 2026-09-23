<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

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
</script>

<div class="space-y-1">
	{#each items as item (item.key)}
		<button
			type="button"
			class="ui-list-button border-t border-border px-0 py-0.5"
			disabled={
				discogsApi.searching
				|| discogsApi.isRateLimited
				|| crawlState.isRunning
				|| discogsApi.isBlockedDiscogsEntity(searchType as SearchType, item.discogsId!)
			}
			onclick={() => discogsApi.search(item.query ?? '', searchType || undefined)}
		>
			{item.label}
		</button>
	{/each}
</div>
