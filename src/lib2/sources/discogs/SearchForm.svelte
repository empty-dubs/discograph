<script lang="ts">
	import { search } from './client';
	import { searchResultLabel } from './patches/compositions';
	import { isBlocked, seedFromResult } from './load';

	import type { SearchResult, SearchType } from './types';

	let query = $state('');
	let searchType = $state<SearchType | ''>('');
	let results = $state<SearchResult[]>([]);
	let error = $state<string | null>(null);
	let searching = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		const trimmed = query.trim();

		if (!trimmed || searching) return;

		searching = true;
		error = null;

		try {
			const response = await search(trimmed, searchType || undefined);

			results = response.results;
		} catch (err) {
			results = [];
			error = err instanceof Error ? err.message : 'Search failed';
		} finally {
			searching = false;
		}
	}

	function pick(result: SearchResult) {
		if (isBlocked(result.type, result.id)) return;

		seedFromResult(result);
		results = [];
	}
</script>

<form class="relative flex min-w-0 flex-1 flex-wrap items-center gap-2" onsubmit={submit}>
	<label class="sr-only" for="catalog-search">Search Discogs</label>
	<input
		id="catalog-search"
		class="ui-field min-w-48 flex-1"
		type="search"
		placeholder="Search Discogs…"
		bind:value={query}
		autocomplete="off"
	/>
	<select class="ui-field w-28" aria-label="Entity type" bind:value={searchType}>
		<option value="">All</option>
		<option value="artist">Artist</option>
		<option value="label">Label</option>
		<option value="release">Release</option>
		<option value="master">Master</option>
	</select>
	<button class="ui-button" type="submit" disabled={searching || !query.trim()}>
		{searching ? 'Searching…' : 'Search'}
	</button>

	{#if error}
		<p class="text-danger m-0 w-full text-sm">{error}</p>
	{/if}

	{#if results.length > 0}
		<ul
			class="border-border bg-panel absolute top-full z-20 mt-1 max-h-72 w-full min-w-72 overflow-y-auto rounded-md border"
		>
			{#each results as result (result.type + result.id)}
				<li>
					<button
						type="button"
						class="ui-list-button"
						disabled={isBlocked(result.type, result.id)}
						onclick={() => pick(result)}
					>
						<span class="text-muted mr-2 uppercase">{result.type}</span>
						{searchResultLabel(result)}
						{#if result.year}
							<span class="text-muted"> {result.year}</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</form>
