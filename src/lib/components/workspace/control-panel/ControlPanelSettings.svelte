<script lang="ts">
	import { CONTROL_PANEL_HELPER_TEXT } from './constants';

	import ControlPanelCrawlSettings from './ControlPanelCrawlSettings.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import GraphDirectedEdgesToggle from './GraphDirectedEdgesToggle.svelte';
	import GraphEdgeFilters from './GraphEdgeFilters.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';
	import GraphNodeFilters from './GraphNodeFilters.svelte';

	type SettingsTabId = 'entities' | 'relationships' | 'fetch';

	let activeTab = $state<SettingsTabId>('entities');
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		role="tablist"
		aria-label="Settings sections"
		class="border-border flex shrink-0 flex-col border-r pr-2"
	>
		<button
			type="button"
			role="tab"
			id="settings-tab-entities"
			class="ui-tab {activeTab === 'entities' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'entities'}
			aria-controls="settings-panel-entities"
			onclick={() => (activeTab = 'entities')}
		>
			Entities
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-relationships"
			class="ui-tab {activeTab === 'relationships'
				? 'ui-tab-active-left'
				: 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'relationships'}
			aria-controls="settings-panel-relationships"
			onclick={() => (activeTab = 'relationships')}
		>
			Relationships
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-fetch"
			class="ui-tab {activeTab === 'fetch' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'fetch'}
			aria-controls="settings-panel-fetch"
			onclick={() => (activeTab = 'fetch')}
		>
			Fetch
		</button>
	</div>

	<div class="grid min-h-0 min-w-0 flex-1">
		<div
			role="tabpanel"
			id="settings-panel-entities"
			aria-labelledby="settings-tab-entities"
			aria-hidden={activeTab !== 'entities'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'entities' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.settings.entities}>
				<div class="ui-stack text-sm text-gray-400">
					<h4 class="ui-label">Nodes</h4>
					<GraphNodeFilters />
					<h4 class="ui-label">Labels</h4>
					<GraphLabelToggle />
				</div>
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="settings-panel-relationships"
			aria-labelledby="settings-tab-relationships"
			aria-hidden={activeTab !== 'relationships'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'relationships'
				? 'hidden'
				: ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.settings.relationships}>
				<div class="ui-stack text-sm text-gray-400">
					<h4 class="ui-label">Highlight Relationships</h4>
					<GraphEdgeFilters />
					<h4 class="ui-label">Edge Style</h4>
					<GraphDirectedEdgesToggle />
				</div>
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="settings-panel-fetch"
			aria-labelledby="settings-tab-fetch"
			aria-hidden={activeTab !== 'fetch'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'fetch' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.settings.fetch}>
				<div class="max-w-xs">
					<ControlPanelCrawlSettings />
				</div>
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
