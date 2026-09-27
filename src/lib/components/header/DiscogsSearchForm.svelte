<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { infoCircle } from 'svelte-awesome/icons';

	import { seedFromResult } from '$lib/components/shared/loaders/seed';

	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { ALL_NODE_TYPES } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';

	import NodeTypePill from '$lib/components/shared/NodeTypePill.svelte';

	import type { SearchResult, SearchType } from '$lib/discogs/types';

	interface Props { part: 'input' | 'actions'; }

	let { part }: Props = $props();

	const SEARCH_FORM_ID = 'discogs-search';
	const EMPTY_HINT_ID = 'discogs-search-empty-hint';

	const typeOptions: { value: SearchType | ''; label: string }[] = [
		{ value: '', label: 'All types' },
		{ value: 'artist', label: 'Artist' },
		{ value: 'label', label: 'Label' },
		{ value: 'release', label: 'Release' },
		{ value: 'master', label: 'Master' }
	];

	let showEmptyResults = $state(false);

	const emptyMessage = $derived(showEmptyResults ? 'No results found' : null);

	const isSearchBlocked = $derived(
		discogsApi.searching || discogsApi.isRateLimited || crawlState.isRunning
	);

	const isSubmitDisabled = $derived(isSearchBlocked || !discogsApi.searchQuery.trim());

	const rateLimitText = $derived.by(() => {
		const { limit, remaining } = discogsApi.rateLimit;

		if (limit === null || remaining === null) return null;

		if (graph.data.isEmpty && discogsApi.searchResults.length === 0) return null;

		return `${remaining}/${limit} API requests remaining`;
	});

	const showRateLimitHint = $derived(discogsApi.isRateLimited);

	const searchInfo = $derived.by(() => {
		const lines: {
			id: string;
			text: string;
			tone: 'muted' | 'warning' | 'danger';
			wrap?: boolean;
		}[] = [];

		if (crawlState.isRunning) {
			lines.push({
				id: 'crawl-running',
				text: 'Crawl in progress...',
				tone: 'warning',
				wrap: true
			});
		}

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
			: discogsApi.isRateLimited || crawlState.isRunning
				? 'text-warning'
				: 'text-muted'
	);

	function clearEmptySearchFeedback() {
		showEmptyResults = false;
	}

	async function handleSearch(event: Event) {
		event.preventDefault();

		clearEmptySearchFeedback();

		await discogsApi.search(
			discogsApi.searchQuery,
			discogsApi.searchType || undefined
		);

		if (
			discogsApi.searchResults.length === 0
			&& discogsApi.searchQuery.trim() !== ''
			&& discogsApi.error === null
		) {
			showEmptyResults = true;
		}
	}

	async function pickResult(result: SearchResult) {
		await seedFromResult(graph, result);

		clearEmptySearchFeedback();
	}

	$effect(() => {
		if (part !== 'input') return;

		if (discogsApi.searchResults.length === 0 && !showEmptyResults) return;

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				discogsApi.clearSearchResults();
				clearEmptySearchFeedback();
			}
		};

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	$effect(() => {
		if (part !== 'input') return;

		if (!discogsApi.searchQuery.trim()) {
			discogsApi.clearSearchResults();
			clearEmptySearchFeedback();
		}
	});
</script>

{#if part === 'input'}
	<form
		id={SEARCH_FORM_ID}
		class="hidden min-w-0 flex-1 sufficient:block"
		onsubmit={handleSearch}
	>
		<div class="relative min-w-0">
			<input
				type="search"
				class="ui-field discogs-search-input w-full pr-9 {showEmptyResults ? 'ring-1 ring-warning/50' : ''}"
				class:pr-14={discogsApi.searchQuery.length > 0}
				placeholder="Search Discogs…"
				bind:value={discogsApi.searchQuery}
				disabled={isSearchBlocked}
				aria-invalid={showEmptyResults ? true : undefined}
				aria-describedby={showEmptyResults ? EMPTY_HINT_ID : undefined}
			/>

			{#if discogsApi.searchQuery.length > 0}
				<button
					type="button"
					class="text-muted hover:text-gray-200 absolute top-1/2 right-8 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-lg leading-none disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Clear search"
					disabled={discogsApi.searching}
					onclick={() => discogsApi.clearSearch()}
				>
					×
				</button>
			{/if}

			<div class="group absolute top-1/2 right-2 z-[100] -translate-y-1/2">
				<span
					class="hover:text-gray-200 block p-1 {iconToneClass}"
					aria-label="API and search status"
				>
					<Icon data={infoCircle} />
				</span>

				<div
					role="tooltip"
					class="border-border bg-panel pointer-events-none absolute top-full right-0 z-[100] mt-2 min-w-max rounded-md border px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
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

			{#if discogsApi.searchResults.length > 0}
				<ul
					class="border-border bg-panel absolute top-full right-0 left-0 z-50 mt-2 max-h-40 overflow-y-auto rounded-md border shadow-lg"
				>
					{#each discogsApi.searchResults as result (result.id + result.type)}
						<li class="border-border border-t first:border-t-0">
							<button
								type="button"
								class="ui-list-button flex items-center gap-2"
								onclick={() => pickResult(result)}
							>
								{#if ALL_NODE_TYPES.includes(result.type)}
									<NodeTypePill type={result.type} />
								{/if}
								<span class="flex-1">{result.title ?? result.name}</span>
								{#if result.year}
									<span class="text-muted text-sm">{result.year}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else if showEmptyResults && discogsApi.searchQuery.trim() !== ''}
				<div
					id={EMPTY_HINT_ID}
					role="status"
					aria-live="polite"
					class="border-border bg-panel absolute top-full right-0 left-0 z-50 mt-2 rounded-md border px-3 py-2 text-sm shadow-lg"
				>
					<p class="text-muted m-0">No results found for “{discogsApi.searchQuery}”.</p>
				</div>
			{/if}
		</div>
	</form>
{:else}
	<div class="hidden w-full min-w-0 items-center justify-start gap-2 sufficient:col-start-2 sufficient:flex">
		<select
			form={SEARCH_FORM_ID}
			class="ui-field discogs-search-field min-w-0 flex-1 cursor-pointer text-center disabled:cursor-not-allowed"
			bind:value={discogsApi.searchType}
			disabled={isSearchBlocked}
		>
			{#each typeOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>

		<button
			type="submit"
			form={SEARCH_FORM_ID}
			class="ui-button inline-flex flex-1 items-center justify-center"
			disabled={isSubmitDisabled}
		>
			{discogsApi.searching ? 'Searching…' : 'Search'}
		</button>
	</div>
{/if}

<style>
	.discogs-search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		appearance: none;
	}

	.discogs-search-input::-ms-clear {
		display: none;
	}

	select.discogs-search-field {
		appearance: auto;
		line-height: 1.25rem;
	}
</style>
