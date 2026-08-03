<script lang="ts">
	import type { SearchType } from '$lib/discogs/types';
	import { graphStore } from '$lib/graph/store.svelte';

	const typeOptions: { value: SearchType | ''; label: string }[] = [
		{ value: '', label: 'All types' },
		{ value: 'artist', label: 'Artist' },
		{ value: 'label', label: 'Label' },
		{ value: 'release', label: 'Release' },
		{ value: 'master', label: 'Master' }
	];

	const fieldClass =
		'rounded-md border border-border bg-panel px-3 py-2 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

	let query = $state('');
	let type = $state<SearchType | ''>('');
	let searching = $state(false);
	let emptyMessage = $state<string | null>(null);

	async function handleSearch(event: Event) {
		event.preventDefault();

		if (!query.trim() || searching || graphStore.isRateLimited) return;

		searching = true;
		emptyMessage = null;

		try {
			const results = await graphStore.search(query.trim(), type || undefined);

			if (results.length === 0) {
				emptyMessage = 'No results found';
			}
		} finally {
			searching = false;
		}
	}

	async function pickResult(result: (typeof graphStore.searchResults)[number]) {
		await graphStore.seedFromResult(result);
		emptyMessage = null;
	}
</script>

<form class="flex flex-wrap gap-2" onsubmit={handleSearch}>
	<input
		type="search"
		class="{fieldClass} min-w-0 flex-1"
		placeholder="Search Discogs…"
		bind:value={query}
		disabled={searching || graphStore.isRateLimited}
	/>

	<select
		class="{fieldClass} cursor-pointer"
		bind:value={type}
		disabled={searching || graphStore.isRateLimited}
	>
		{#each typeOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	<button
		type="submit"
		class="{fieldClass} border-accent bg-accent cursor-pointer text-white"
		disabled={searching || !query.trim() || graphStore.isRateLimited}
	>
		{searching ? 'Searching…' : 'Search'}
	</button>
</form>

{#if emptyMessage}
	<p class="text-muted mt-2 text-sm">{emptyMessage}</p>
{/if}

{#if graphStore.searchResults.length > 0}
	<ul class="border-border bg-panel mt-2 max-h-40 overflow-y-auto rounded-md border">
		{#each graphStore.searchResults as result (result.id + result.type)}
			<li class="border-border border-t first:border-t-0">
				<button
					type="button"
					class="hover:bg-panel-hover flex w-full items-center gap-2 border-none bg-transparent px-3 py-2 text-left"
					onclick={() => pickResult(result)}
				>
					<span class="min-w-16 text-muted text-xs uppercase">{result.type}</span>
					<span class="flex-1">{result.title ?? result.name}</span>
					{#if result.year}
						<span class="text-muted text-sm">{result.year}</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
{/if}
