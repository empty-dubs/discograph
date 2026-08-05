<script lang="ts">
	import type { SearchType } from '$lib/discogs/types';
	import { graphStore } from '$lib/graph/store.svelte';

	interface Item {
		label: string;
		query: string;
		key?: string;
	}

	interface Props {
		items: Item[];
		searchType?: SearchType | '';
	}

	let { items, searchType = '' }: Props = $props();

	function assignEachKeys(items: Item[]): (Item & { eachKey: string })[] {
		const seen = new Map<string, number>();

		return items.map((item) => {
			const base = item.key ?? item.query;
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);

			const eachKey = count === 0 ? base : `${base}-${count}`;

			return { ...item, eachKey };
		});
	}

	const keyedItems = $derived(assignEachKeys(items));
</script>

<div class="space-y-1">
	{#each keyedItems as item (item.eachKey)}
		<button
			type="button"
			class="hover:bg-panel-hover block w-full rounded border-none bg-transparent px-0 py-0.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
			disabled={graphStore.searching || graphStore.isRateLimited}
			onclick={() => graphStore.search(item.query, searchType || undefined)}
		>
			{item.label}
		</button>
	{/each}
</div>
