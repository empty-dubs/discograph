<script lang="ts">
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import { CONTROL_PANEL_HELPER_TEXT } from './constants';
	import ControlPanelCrawlTab from './ControlPanelCrawl.svelte';
	import ControlPanelExplore from './ControlPanelExplore.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	type ExploreSubTabId = 'explore' | 'crawl';

	interface Props {
		isLoading?: boolean;
	}

	let { isLoading = $bindable(false) }: Props = $props();

	let activeExploreTab = $state<ExploreSubTabId>('explore');

    $effect(() => {
        isLoading = selectedNodeState.hasLoadingChildren || crawlState.isRunning;
    });
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		role="tablist"
		aria-label="Discover sections"
		class="border-border flex shrink-0 flex-col border-r pr-2"
	>
		<button
			type="button"
			role="tab"
			id="discover-subtab-explore"
			class="ui-tab {activeExploreTab === 'explore' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeExploreTab === 'explore'}
			aria-controls="discover-panel-explore"
			onclick={() => (activeExploreTab = 'explore')}
		>
			<span class="inline-flex items-center gap-1.5">
				{#if selectedNodeState.hasLoadingChildren}<LoadingIcon />{/if}
				Explore
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-crawl"
			class="ui-tab {activeExploreTab === 'crawl' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeExploreTab === 'crawl'}
			aria-controls="discover-panel-crawl"
			onclick={() => (activeExploreTab = 'crawl')}
		>
			<span class="inline-flex items-center gap-1.5">
				{#if crawlState.isRunning}<LoadingIcon />{/if}
				Crawl
			</span>
		</button>
	</div>

	<div class="grid min-h-0 min-w-0 flex-1">
		<div
			role="tabpanel"
			id="discover-panel-explore"
			aria-labelledby="discover-subtab-explore"
			aria-hidden={activeExploreTab !== 'explore'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeExploreTab !== 'explore' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.explore}>
				<ControlPanelExplore />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-crawl"
			aria-labelledby="discover-subtab-crawl"
			aria-hidden={activeExploreTab !== 'crawl'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeExploreTab !== 'crawl' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.crawl}>
				<ControlPanelCrawlTab />
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
