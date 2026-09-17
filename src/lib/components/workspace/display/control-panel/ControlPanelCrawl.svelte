<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { getCrawlNodeType, runBFSCrawl } from '$lib/graph/operations/crawlers';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';

	const fieldClass =
		'box-border h-9 w-full rounded-md border border-border bg-panel px-3 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

	const labelClass = 'text-muted text-xs font-semibold tracking-wide uppercase';

	const buttonClass =
		'box-border h-9 w-full cursor-pointer rounded-md border border-accent bg-accent px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50';

	const node = $derived(selectedNodeState);

	const crawlNodeType = $derived(getCrawlNodeType(crawlState.mode));
	const seedMatchesMode = $derived(node.data?.type === crawlNodeType);

	const isSeedBlocked = $derived(
		node.data
		&& node.data.discogsId !== null
		&& node.isBlocked
	);

	const isCrawlDisabled = $derived(
		!node.id
		|| !seedMatchesMode
		|| isSeedBlocked
		|| crawlState.isRunning
		|| discogsApi.isRateLimited
	);

	async function crawl() {
		if (isCrawlDisabled || !node.data || node.isBlocked) return;

		if (node.data.type !== crawlNodeType) {
			discogsApi.setError(`Crawl mode ${crawlState.mode} requires a selected ${crawlNodeType} node`);
			return;
		}

		discogsApi.clearError();

		crawlState.isRunning = true;

		await runBFSCrawl(
			graph,
			node.data,
			crawlState.mode,
			crawlState.depth
		);
	}
</script>

<div class="flex max-w-xs flex-col gap-3" role="group" aria-label="Crawl settings">
	<div class="flex flex-col gap-1.5">
		<label class={labelClass} for="crawl-mode">Mode</label>
		<select
			id="crawl-mode"
			class={fieldClass}
			bind:value={crawlState.mode}
			disabled={crawlState.isRunning}
		>
			<option value="artist-artist">artist-artist</option>
			<option value="label-label">label-label</option>
		</select>
	</div>

	<ControlPanelNumberInput
		id="crawl-depth"
		label="Depth"
		max={10}
		bind:value={crawlState.depth}
	/>

	<button type="button" class={buttonClass} disabled={isCrawlDisabled} onclick={crawl}>
		{crawlState.isRunning ? 'Crawling…' : 'Crawl'}
	</button>
</div>
