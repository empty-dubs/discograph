<script lang="ts">
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import { CONTROL_PANEL_HELPER_TEXT } from './constants';
	import ControlPanelCrawlTab from './ControlPanelCrawl.svelte';
	import ControlPanelExplore from './ControlPanelExplore.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	type ExploreSubTabId = 'explore' | 'crawl';

	let activeExploreTab = $state<ExploreSubTabId>('explore');
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		role="tablist"
		aria-label="Explore sections"
		class="border-border flex shrink-0 flex-col border-r pr-2"
	>
		<button
			type="button"
			role="tab"
			id="explore-subtab-explore"
			class="ui-tab {activeExploreTab === 'explore' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeExploreTab === 'explore'}
			aria-controls="explore-panel-explore"
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
			id="explore-subtab-crawl"
			class="ui-tab {activeExploreTab === 'crawl' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeExploreTab === 'crawl'}
			aria-controls="explore-panel-crawl"
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
			id="explore-panel-explore"
			aria-labelledby="explore-subtab-explore"
			aria-hidden={activeExploreTab !== 'explore'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeExploreTab !== 'explore' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.explore}>
				<ControlPanelExplore />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="explore-panel-crawl"
			aria-labelledby="explore-subtab-crawl"
			aria-hidden={activeExploreTab !== 'crawl'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeExploreTab !== 'crawl' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.crawl}>
				<ControlPanelCrawlTab />
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
