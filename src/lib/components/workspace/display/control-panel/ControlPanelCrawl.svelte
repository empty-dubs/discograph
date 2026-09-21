<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { getCrawlNodeType, runBFSCrawl } from '$lib/graph/operations/crawlers';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';

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

	$effect(() => {
		if (crawlState.isRunning) return;

		const type = node.data?.type;

		if (type === 'artist') crawlState.mode = 'artist-artist';
		else if (type === 'label') crawlState.mode = 'label-label';
	});

	async function crawl() {
		if (isCrawlDisabled || !node.data || node.isBlocked) return;

		if (node.data.type !== crawlNodeType) {
			discogsApi.setError(`Crawl mode ${crawlState.mode} requires a selected ${crawlNodeType} node`);
			return;
		}

		discogsApi.clearError();

		crawlState.beginCrawl();

		await runBFSCrawl(
			graph,
			node.data,
			crawlState.mode,
			crawlState.depth
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
				bind:value={crawlState.mode}
				disabled={crawlState.isRunning}
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
				disabled={crawlState.isRunning}
				bind:value={crawlState.depth}
			/>
		</div>
	</div>

	{#if crawlState.isRunning}
		<button type="button" class="ui-button w-full" onclick={() => crawlState.requestStop()}>
			Stop
		</button>
	{:else}
		<button type="button" class="ui-button w-full" disabled={isCrawlDisabled} onclick={crawl}>
			Crawl
		</button>
	{/if}
</div>
