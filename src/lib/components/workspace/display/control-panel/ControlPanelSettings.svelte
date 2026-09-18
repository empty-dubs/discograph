<script lang="ts">
	import { ALL_EDGE_TYPES, ALL_NODE_TYPES } from '$lib/graph/constants';

	import ControlPanelCrawlSettings from './ControlPanelCrawlSettings.svelte';
	import GraphEdgeFilters from './GraphEdgeFilters.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';
	import GraphNodeFilters from './GraphNodeFilters.svelte';

	type SettingsTabId = 'nodes' | 'relationships' | 'expansion';

	let activeSettingsTab = $state<SettingsTabId>('nodes');
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
			id="settings-tab-nodes"
			class={activeSettingsTab === 'nodes' ? 'ui-tab ui-tab-active-left' : 'ui-tab ui-tab-inactive-left'}
			aria-selected={activeSettingsTab === 'nodes'}
			aria-controls="settings-panel-nodes"
			onclick={() => (activeSettingsTab = 'nodes')}
		>
			Nodes
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-relationships"
			class={activeSettingsTab === 'relationships'
				? 'ui-tab ui-tab-active-left'
				: 'ui-tab ui-tab-inactive-left'}
			aria-selected={activeSettingsTab === 'relationships'}
			aria-controls="settings-panel-relationships"
			onclick={() => (activeSettingsTab = 'relationships')}
		>
			Relationships
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-expansion"
			class={activeSettingsTab === 'expansion' ? 'ui-tab ui-tab-active-left' : 'ui-tab ui-tab-inactive-left'}
			aria-selected={activeSettingsTab === 'expansion'}
			aria-controls="settings-panel-expansion"
			onclick={() => (activeSettingsTab = 'expansion')}
		>
			Expansion
		</button>
	</div>

	<div class="grid min-w-0 flex-1">
		<div
			role="tabpanel"
			id="settings-panel-nodes"
			aria-labelledby="settings-tab-nodes"
			aria-hidden={activeSettingsTab !== 'nodes'}
			class="col-start-1 row-start-1 {activeSettingsTab !== 'nodes'
				? 'invisible pointer-events-none'
				: ''}"
		>
			<div class="ui-stack text-sm text-gray-400">
				<h4 class="ui-label">Toggle Nodes</h4>
				<GraphLabelToggle />
				<GraphNodeFilters types={ALL_NODE_TYPES} />
			</div>
		</div>
		<div
			role="tabpanel"
			id="settings-panel-relationships"
			aria-labelledby="settings-tab-relationships"
			aria-hidden={activeSettingsTab !== 'relationships'}
			class="col-start-1 row-start-1 {activeSettingsTab !== 'relationships'
				? 'invisible pointer-events-none'
				: ''}"
		>
			<div class="ui-stack text-sm text-gray-400">
				<h4 class="ui-label">Highlight Relationships</h4>
				<GraphEdgeFilters edgeTypes={ALL_EDGE_TYPES} />
			</div>
		</div>
		<div
			role="tabpanel"
			id="settings-panel-expansion"
			aria-labelledby="settings-tab-expansion"
			aria-hidden={activeSettingsTab !== 'expansion'}
			class="col-start-1 row-start-1 {activeSettingsTab !== 'expansion'
				? 'invisible pointer-events-none'
				: ''}"
		>
			<div class="max-w-xs">
				<ControlPanelCrawlSettings />
			</div>
		</div>
	</div>
</div>
