<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { getCrawlNeighborIds, getCrawlNodeType, runBFSCrawl } from '$lib/graph/operations/crawlers';

	import CrawlState from '$lib/stores/CrawlState.svelte';
	import SelectedNodeState from '$lib/stores/SelectedNodeState.svelte';
	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';

	const node = $derived(SelectedNodeState);

	const crawlNodeType = $derived(getCrawlNodeType(CrawlState.mode));
	const seedMatchesMode = $derived(node.data?.type === crawlNodeType);
	const hasNoCrawlNeighbors = $derived(getCrawlNeighborIds(node.data!, CrawlState.mode).length === 0);

	const isSeedBlocked = $derived(
		node.data
		&& node.data.discogsId !== null
		&& node.isBlocked
	);

	const isCrawlDisabled = $derived(
		!node.id
		|| !node.data
		|| !node.isDetailsFetched
		|| node.hasLoadingChildren
		|| !seedMatchesMode
		|| isSeedBlocked
		|| hasNoCrawlNeighbors
		|| CrawlState.isRunning
		|| discogsApi.isRateLimited
	);

	$effect(() => {
		if (CrawlState.isRunning) return;

		const type = node.data?.type;

		if (type === 'artist') CrawlState.mode = 'artist-artist';
		else if (type === 'label') CrawlState.mode = 'label-label';
	});

	async function crawl() {
		if (isCrawlDisabled || !node.data || node.isBlocked) return;

		if (node.data.type !== crawlNodeType) {
			discogsApi.setError(`Crawl mode ${CrawlState.mode} requires a selected ${crawlNodeType} node`);
			return;
		}

		discogsApi.clearError();

		CrawlState.beginCrawl();

		await runBFSCrawl(
			graph,
			node.data,
			CrawlState.mode,
			CrawlState.depth
		);
	}
</script>

<div class="flex w-full min-w-0 flex-col gap-3" role="group" aria-label="Crawl settings">
	<div class="grid min-w-0 grid-cols-2 gap-3">
		<div class="ui-stack min-w-0">
			<label class="ui-label" for="crawl-mode">Mode</label>
			<select
				id="crawl-mode"
				class="ui-field w-full"
				bind:value={CrawlState.mode}
				disabled={CrawlState.isRunning}
			>
				<option value="artist-artist">artist-artist</option>
				<option value="label-label">label-label</option>
			</select>
		</div>

		<div class="min-w-0">
			<ControlPanelNumberInput
				id="crawl-depth"
				label="Depth"
				max={5}
				disabled={CrawlState.isRunning}
				bind:value={CrawlState.depth}
			/>
		</div>
	</div>

	{#if CrawlState.isRunning}
		<button type="button" class="ui-button w-full" onclick={() => CrawlState.requestStop()}>
			Stop
		</button>
	{:else}
		<button type="button" class="ui-button w-full" disabled={isCrawlDisabled} onclick={crawl}>
			Crawl
		</button>
	{/if}
</div>
