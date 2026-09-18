<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown, chevronUp } from 'svelte-awesome/icons';

	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import { CONTROL_PANEL_HELPER_TEXT } from './control-panel/constants';

	import ControlPanelCrawlTab from './control-panel/ControlPanelCrawl.svelte';
	import ControlPanelHelperLayout from './control-panel/ControlPanelHelperLayout.svelte';
	import ControlPanelSettings from './control-panel/ControlPanelSettings.svelte';
	import ControlPanelExplore from './control-panel/ControlPanelExplore.svelte';
	import LoadingIcon from './control-panel/LoadingIcon.svelte';

	type TabId = 'explore' | 'crawl' | 'settings';

	let activeTab = $state<TabId>('explore');
	let isExpanded = $state(true);

	function selectTab(tab: TabId) {
		activeTab = tab;
		isExpanded = true;
	}
</script>

<div class="flex flex-col">
	<button
		type="button"
		class="ui-collapse-handle"
		aria-expanded={isExpanded}
		aria-controls="control-panel-body"
		aria-label="Collapse control panel"
		onclick={() => (isExpanded = !isExpanded)}
	>
		{#if isExpanded}
			<Icon data={chevronDown} />
		{:else}
			<Icon data={chevronUp} />
		{/if}
	</button>
	<div class="flex flex-col {isExpanded ? 'gap-4' : ''}">
		<div role="tablist" aria-label="Control panel sections" class="flex gap-1 {isExpanded ? 'border-b border-border' : ''}">
			<button
				type="button"
				role="tab"
				id="control-panel-tab-explore"
				class="ui-tab {activeTab === 'explore' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				aria-selected={activeTab === 'explore'}
				aria-controls="control-panel-panel-explore"
				onclick={() => selectTab('explore')}
			>
				{#if selectedNodeState.hasLoadingChildren}<LoadingIcon />{/if}
				Explore
			</button>
			<button
				type="button"
				role="tab"
				id="control-panel-tab-crawl"
				class="ui-tab {activeTab === 'crawl' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				aria-selected={activeTab === 'crawl'}
				aria-controls="control-panel-panel-crawl"
				onclick={() => selectTab('crawl')}
			>
				<span class="inline-flex items-center gap-1.5">
					{#if crawlState.isRunning}<LoadingIcon />{/if}
					Crawl
				</span>
			</button>
			<button
				type="button"
				role="tab"
				id="control-panel-tab-settings"
				class="ui-tab {activeTab === 'settings' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				aria-selected={activeTab === 'settings'}
				aria-controls="control-panel-panel-settings"
				onclick={() => selectTab('settings')}
			>
				Settings
			</button>
		</div>

		<div
			id="control-panel-body"
			class="grid transition-[grid-template-rows] duration-300 ease-in-out"
			style:grid-template-rows={isExpanded ? '1fr' : '0fr'}
		>
			<div class="min-h-0 overflow-hidden">
				<div class="grid">
					<div
						role="tabpanel"
						id="control-panel-panel-explore"
						aria-labelledby="control-panel-tab-explore"
						aria-hidden={activeTab !== 'explore' || !isExpanded}
						class="col-start-1 row-start-1 {activeTab !== 'explore'
							? 'invisible pointer-events-none'
							: ''}"
					>
						<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.explore}>
							<ControlPanelExplore />
						</ControlPanelHelperLayout>
					</div>
					<div
						role="tabpanel"
						id="control-panel-panel-settings"
						aria-labelledby="control-panel-tab-settings"
						aria-hidden={activeTab !== 'settings' || !isExpanded}
						class="col-start-1 row-start-1 {activeTab !== 'settings'
							? 'invisible pointer-events-none'
							: ''}"
					>
						<ControlPanelSettings />
					</div>
					<div
						role="tabpanel"
						id="control-panel-panel-crawl"
						aria-labelledby="control-panel-tab-crawl"
						aria-hidden={activeTab !== 'crawl' || !isExpanded}
						class="col-start-1 row-start-1 {activeTab !== 'crawl'
							? 'invisible pointer-events-none'
							: ''}"
					>
						<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.crawl}>
							<ControlPanelCrawlTab />
						</ControlPanelHelperLayout>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
