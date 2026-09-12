<script lang="ts">
	import ControlPanelCrawlTab from './control-panel/ControlPanelCrawl.svelte';
	import ControlPanelSettings from './control-panel/ControlPanelSettings.svelte';
	import ControlPanelExplore from './control-panel/ControlPanelExplore.svelte';

	type TabId = 'explore' | 'crawl' | 'settings';

	let activeTab = $state<TabId>('explore');

	const tabClass =
		'cursor-pointer border-none bg-transparent py-2 pl-0 pr-3 text-left text-sm font-medium transition-colors';

	function tabButtonClass(tab: TabId): string {
		return activeTab === tab
			? `${tabClass} border-accent text-gray-200 border-b-2`
			: `${tabClass} text-muted hover:text-gray-200 border-b-2 border-transparent`;
	}
</script>

<div class="flex flex-col gap-4">
	<div role="tablist" aria-label="Control panel sections" class="flex gap-1 border-b border-border">
		<button
			type="button"
			role="tab"
			id="control-panel-tab-explore"
			class={tabButtonClass('explore')}
			aria-selected={activeTab === 'explore'}
			aria-controls="control-panel-panel-explore"
			onclick={() => (activeTab = 'explore')}
		>
			Explore
		</button>
		<button
			type="button"
			role="tab"
			id="control-panel-tab-crawl"
			class={tabButtonClass('crawl')}
			aria-selected={activeTab === 'crawl'}
			aria-controls="control-panel-panel-crawl"
			onclick={() => (activeTab = 'crawl')}
		>
			Crawl
		</button>
		<button
			type="button"
			role="tab"
			id="control-panel-tab-settings"
			class={tabButtonClass('settings')}
			aria-selected={activeTab === 'settings'}
			aria-controls="control-panel-panel-settings"
			onclick={() => (activeTab = 'settings')}
		>
			Settings
		</button>
	</div>

	{#if activeTab === 'explore'}
		<div
			role="tabpanel"
			id="control-panel-panel-explore"
			aria-labelledby="control-panel-tab-explore"
		>
			<ControlPanelExplore />
		</div>
	{:else if activeTab === 'settings'}
		<div
			role="tabpanel"
			id="control-panel-panel-settings"
			aria-labelledby="control-panel-tab-settings"
		>
			<ControlPanelSettings />
		</div>
	{:else}
		<div
			role="tabpanel"
			id="control-panel-panel-crawl"
			aria-labelledby="control-panel-tab-crawl"
		>
			<ControlPanelCrawlTab />
		</div>
	{/if}
</div>
