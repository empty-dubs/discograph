<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { infoCircle } from 'svelte-awesome/icons';
	import { seedFromResult } from '$lib/components/workspace/actions/loaders/seed';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';

	import type { SearchResult, SearchType } from '$lib/discogs/types';

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

	const rateLimitText = $derived.by(() => {
		const { limit, remaining } = discogsApi.rateLimit;

		if (graph.data.isEmpty || limit === null || remaining === null) return null;

		return `${remaining}/${limit} API requests remaining`;
	});

	const showRateLimitHint = $derived(
		discogsApi.error !== null || discogsApi.isRateLimited
	);

	const searchInfo = $derived.by(() => {
		const lines: {
			id: string;
			text: string;
			tone: 'muted' | 'warning' | 'danger';
			wrap?: boolean;
		}[] = [];

		if (rateLimitText) {
			lines.push({
				id: 'rate-limit',
				text: rateLimitText,
				tone: discogsApi.isRateLimited ? 'warning' : 'muted'
			});
		}

		if (discogsApi.error) {
			lines.push({ id: 'error', text: discogsApi.error, tone: 'danger' });
		}

		if (showRateLimitHint) {
			lines.push({
				id: 'rate-limit-hint',
				text: 'You may be making too many requests. Wait 60 seconds to resume exploration.',
				tone: 'warning',
				wrap: true
			});
		}

		if (emptyMessage) {
			lines.push({ id: 'empty-message', text: emptyMessage, tone: 'muted' });
		}

		return lines;
	});

	const iconToneClass = $derived(
		discogsApi.error
			? 'text-danger'
			: discogsApi.isRateLimited
				? 'text-warning'
				: 'text-muted'
	);

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
			if (event.key === 'Escape') {
				event.preventDefault();
				discogsApi.clearSearchResults();
			}
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

<form class="flex flex-wrap items-center gap-2" onsubmit={handleSearch}>
		<div class="group relative z-[100] flex shrink-0 items-center">
			<span
				class="hover:text-gray-200 block p-1 {iconToneClass}"
				aria-label="API and search status"
			>
				<Icon data={infoCircle} />
			</span>

			<div
				role="tooltip"
				class="border-border bg-panel pointer-events-none absolute top-full left-0 z-[100] mt-2 min-w-max rounded-md border px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
			>
				{#each searchInfo as line (line.id)}
					<p
						class="m-0 {line.wrap ? 'max-w-xs whitespace-normal' : 'whitespace-nowrap'}"
						class:text-muted={line.tone === 'muted'}
						class:text-warning={line.tone === 'warning'}
						class:text-danger={line.tone === 'danger'}
					>
						{line.text}
					</p>
				{:else}
					<p class="text-muted m-0 whitespace-nowrap">Search for an artist, label, or release to begin.</p>
				{/each}
			</div>
		</div>

		<div class="relative flex min-w-0 flex-1 flex-wrap gap-2">
			<div class="relative min-w-0 flex-1">
				<input
					type="search"
					class="{fieldClass} w-full pr-9"
					placeholder="Search Discogs…"
					bind:value={discogsApi.searchQuery}
					disabled={discogsApi.searching || discogsApi.isRateLimited}
				/>

				{#if discogsApi.searchQuery.length > 0}
					<button
						type="button"
						class="text-muted hover:text-gray-200 absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-lg leading-none disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Clear search"
						disabled={discogsApi.searching}
						onclick={() => discogsApi.clearSearch()}
					>
						×
					</button>
				{/if}
			</div>

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
		</div>
	</form>
