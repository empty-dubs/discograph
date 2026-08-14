<script lang="ts">
	import type { SearchResult, SearchType } from '$lib/discogs/types';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';

	import { seedFromResult } from '$lib/graph/loaders/seed';

	const typeOptions: { value: SearchType | ''; label: string }[] = [
		{ value: '', label: 'All types' },
		{ value: 'artist', label: 'Artist' },
		{ value: 'label', label: 'Label' },
		{ value: 'release', label: 'Release' },
		{ value: 'master', label: 'Master' }
	];

	const fieldClass =
		'rounded-md border border-border bg-panel px-3 py-2 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50';
	const headerTextClass = 'mt-1 mb-0 text-sm';

	let emptyMessage = $state<string | null>(null);

	const rateLimitText = $derived.by(() => {
		const { limit, remaining } = discogsApi.rateLimit;

		if (limit === null || remaining === null) return null;

		return `${remaining}/${limit} API requests remaining`;
	});

	async function handleSearch(event: Event) {
		event.preventDefault();

		emptyMessage = null;

		await discogsApi.search(
			discogsApi.searchQuery,
			discogsApi.searchType || undefined
		);

		if (discogsApi.searchResults.length === 0 && discogsApi.searchQuery.trim()) {
			emptyMessage = 'No results found';
		}
	}

	async function pickResult(result: SearchResult) {
		await seedFromResult(graph, result);

		emptyMessage = null;
	}

	$effect(() => {
		if (discogsApi.searchResults.length === 0) return;

		const handleKeydown = (event: KeyboardEvent) => {
			event.preventDefault();

			if (event.key === 'Escape') discogsApi.clearSearchResults();
		};

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	$effect(() => {
		if (!discogsApi.searchQuery.trim()) {
			discogsApi.clearSearchResults();
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
			bind:value={discogsApi.searchQuery}
			disabled={discogsApi.searching || discogsApi.isRateLimited}
		/>

		<select
			class="{fieldClass} cursor-pointer"
			bind:value={discogsApi.searchType}
			disabled={discogsApi.searching || discogsApi.isRateLimited}
		>
			{#each typeOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>

		<button
			type="submit"
			class="{fieldClass} border-accent bg-accent cursor-pointer text-white"
			disabled={discogsApi.searching || !discogsApi.searchQuery.trim() || discogsApi.isRateLimited}
		>
			{discogsApi.searching ? 'Searching…' : 'Search'}
		</button>
	</form>

	{#if emptyMessage}
		<p class="text-muted mt-2 text-sm">{emptyMessage}</p>
	{/if}

	{#if discogsApi.searchResults.length > 0}
		<ul
			class="border-border bg-panel absolute top-full right-0 left-0 z-50 mt-2 max-h-40 overflow-y-auto rounded-md border shadow-lg"
		>
			{#each discogsApi.searchResults as result (result.id + result.type)}
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

	{#if rateLimitText}
		<p class="text-muted {headerTextClass}" class:text-warning={discogsApi.isRateLimited}>
			{rateLimitText}
		</p>
	{/if}

	{#if discogsApi.error}
		<p class="text-danger {headerTextClass}">{discogsApi.error}</p>
	{/if}
</div>
