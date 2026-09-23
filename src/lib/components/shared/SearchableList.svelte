<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { ALL_NODE_TYPES } from '$lib/graph/constants';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

	import NodeTypePill from './NodeTypePill.svelte';

	import type { SearchType } from '$lib/discogs/types';

	interface Item {
		key: string;
		label?: string;
		query?: string;
		discogsId?: number;
		searchType?: SearchType;
	}

	interface Props {
		items: Item[];
	}

	let { items }: Props = $props();
</script>

<div class="space-y-1">
	{#each items as item (item.key)}
		<button
			type="button"
			class="ui-list-button flex items-center gap-2 border-t border-border px-0 py-0.5"
			disabled={
				discogsApi.searching
				|| discogsApi.isRateLimited
				|| crawlState.isRunning
				|| discogsApi.isBlockedDiscogsEntity(item.searchType!, item.discogsId ?? null)
			}
			onclick={() => discogsApi.search(item.query ?? '', item.searchType || undefined)}
		>
			{#if item.searchType && ALL_NODE_TYPES.includes(item.searchType as SearchType)}
				<NodeTypePill type={item.searchType} />
			{/if}
			<span class="min-w-0 truncate">{item.label}</span>
		</button>
	{/each}
</div>
