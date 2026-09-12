<script lang="ts">
	import { ALL_EDGE_TYPES, ALL_NODE_TYPES } from '$lib/graph/constants';

	import ControlPanelCrawlSettings from './ControlPanelCrawlSettings.svelte';
	import GraphEdgeFilters from './GraphEdgeFilters.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';
	import GraphNodeFilters from './GraphNodeFilters.svelte';

	type SettingsTabId = 'display' | 'expansion';

	let activeSettingsTab = $state<SettingsTabId>('display');

	const labelClass = 'text-muted text-xs font-semibold tracking-wide uppercase';

	const groupClass = 'flex flex-col gap-2';

	const tabClass =
		'w-full cursor-pointer border-none bg-transparent py-2 pl-0 pr-3 text-left text-sm font-medium transition-colors';

	function tabButtonClass(tab: SettingsTabId): string {
		return activeSettingsTab === tab
			? `${tabClass} border-accent text-gray-200 border-l-2`
			: `${tabClass} text-muted hover:text-gray-200 border-l-2 border-transparent`;
	}
</script>

<div class="flex flex-row gap-4">
	<div
		role="tablist"
		aria-label="Settings sections"
		class="border-border flex shrink-0 flex-col border-r pr-2"
	>
		<button
			type="button"
			role="tab"
			id="settings-tab-display"
			class={tabButtonClass('display')}
			aria-selected={activeSettingsTab === 'display'}
			aria-controls="settings-panel-display"
			onclick={() => (activeSettingsTab = 'display')}
		>
			Display
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-expansion"
			class={tabButtonClass('expansion')}
			aria-selected={activeSettingsTab === 'expansion'}
			aria-controls="settings-panel-expansion"
			onclick={() => (activeSettingsTab = 'expansion')}
		>
			Expansion
		</button>
	</div>

	<div class="min-w-0 flex-1">
		{#if activeSettingsTab === 'display'}
			<div
				role="tabpanel"
				id="settings-panel-display"
				aria-labelledby="settings-tab-display"
			>
				<div class="grid grid-cols-1 gap-4 text-sm text-gray-400 md:grid-cols-2">
					<div class="min-w-0">
						<div class={groupClass}>
							<h4 class={labelClass}>Toggle Nodes</h4>
							<GraphLabelToggle />
							<GraphNodeFilters types={ALL_NODE_TYPES} />
						</div>
					</div>

					<div class="min-w-0">
						<div class={groupClass}>
							<h4 class={labelClass}>Highlight Relationships</h4>
							<GraphEdgeFilters edgeTypes={ALL_EDGE_TYPES} />
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div
				role="tabpanel"
				id="settings-panel-expansion"
				aria-labelledby="settings-tab-expansion"
			>
				<div class="max-w-xs">
					<ControlPanelCrawlSettings />
				</div>
			</div>
		{/if}
	</div>
</div>
