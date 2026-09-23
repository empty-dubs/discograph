<script lang="ts">
	import { CONTROL_PANEL_HELPER_TEXT } from './constants';

	import ControlPanelCrawlSettings from './ControlPanelCrawlSettings.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import GraphDirectedEdgesToggle from './GraphDirectedEdgesToggle.svelte';
	import GraphEdgeFilters from './GraphEdgeFilters.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';
	import GraphNodeFilters from './GraphNodeFilters.svelte';

	type SettingsTabId = 'entities' | 'relationships' | 'expansion';

	let activeSettingsTab = $state<SettingsTabId>('entities');
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
			class="ui-tab {activeSettingsTab === 'entities' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeSettingsTab === 'entities'}
			aria-controls="settings-panel-entities"
			onclick={() => (activeSettingsTab = 'entities')}
		>
			Entities
		</button>
		<button
			type="button"
			role="tab"
			id="settings-tab-relationships"
			class="ui-tab {activeSettingsTab === 'relationships'
				? 'ui-tab-active-left'
				: 'ui-tab-inactive-left'}"
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
			class="ui-tab {activeSettingsTab === 'expansion' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeSettingsTab === 'expansion'}
			aria-controls="settings-panel-expansion"
			onclick={() => (activeSettingsTab = 'expansion')}
		>
			Expansion
		</button>
	</div>

	<div class="grid min-h-0 min-w-0 flex-1">
		<div
			role="tabpanel"
			id="settings-panel-entities"
			aria-labelledby="settings-tab-entities"
			aria-hidden={activeSettingsTab !== 'entities'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeSettingsTab !== 'entities' ? 'hidden' : ''}"
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
			aria-hidden={activeSettingsTab !== 'relationships'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeSettingsTab !== 'relationships'
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
			id="settings-panel-expansion"
			aria-labelledby="settings-tab-expansion"
			aria-hidden={activeSettingsTab !== 'expansion'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeSettingsTab !== 'expansion' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.settings.expansion}>
				<div class="max-w-xs">
					<ControlPanelCrawlSettings />
				</div>
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
