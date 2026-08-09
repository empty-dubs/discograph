<script lang="ts">
	import type { SearchType } from '$lib/discogs/types';
	import { discogsApiStore } from '$lib/discogs/api-store.svelte';
	import { graph } from '$lib/graph/store/graph.svelte';

	const typeOptions: { value: SearchType | ''; label: string }[] = [
		{ value: '', label: 'All types' },
		{ value: 'artist', label: 'Artist' },
		{ value: 'label', label: 'Label' },
		{ value: 'release', label: 'Release' },
		{ value: 'master', label: 'Master' }
	];

	const fieldClass =
		'rounded-md border border-border bg-panel px-3 py-2 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

	let emptyMessage = $state<string | null>(null);

	async function handleSearch(event: Event) {
		event.preventDefault();

		emptyMessage = null;

		const results = await discogsApiStore.search(
			discogsApiStore.searchQuery,
			discogsApiStore.searchType || undefined
		);

		if (results.length === 0 && discogsApiStore.searchQuery.trim()) {
			emptyMessage = 'No results found';
		}
	}

	async function pickResult(result: (typeof discogsApiStore.searchResults)[number]) {
		await graph.seedFromResult(result);
		emptyMessage = null;
	}

	$effect(() => {
		if (discogsApiStore.searchResults.length === 0) return;

		const handleKeydown = (event: KeyboardEvent) => {
			event.preventDefault();

			if (event.key === 'Escape') discogsApiStore.clearSearchResults();
		};

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	$effect(() => {
		if (!discogsApiStore.searchQuery.trim()) {
			discogsApiStore.clearSearchResults();
			emptyMessage = null;
		}
	});
</script>

<div class="relative">
	<form class="flex flex-wrap gap-2" onsubmit={handleSearch}>
		<input
			type="search"
			class="{fieldClass} min-w-0 flex-1"
			placeholder="Search Discogs…"
			bind:value={discogsApiStore.searchQuery}
			disabled={discogsApiStore.searching || discogsApiStore.isRateLimited}
		/>

		<select
			class="{fieldClass} cursor-pointer"
			bind:value={discogsApiStore.searchType}
			disabled={discogsApiStore.searching || discogsApiStore.isRateLimited}
		>
			{#each typeOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>

		<button
			type="submit"
			class="{fieldClass} border-accent bg-accent cursor-pointer text-white"
			disabled={discogsApiStore.searching || !discogsApiStore.searchQuery.trim() || discogsApiStore.isRateLimited}
		>
			{discogsApiStore.searching ? 'Searching…' : 'Search'}
		</button>
	</form>

	{#if emptyMessage}
		<p class="text-muted mt-2 text-sm">{emptyMessage}</p>
	{/if}

	{#if discogsApiStore.searchResults.length > 0}
		<ul
			class="border-border bg-panel absolute top-full right-0 left-0 z-50 mt-2 max-h-40 overflow-y-auto rounded-md border shadow-lg"
		>
			{#each discogsApiStore.searchResults as result (result.id + result.type)}
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
</div>
