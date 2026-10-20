<script lang="ts">
	import { CONTROL_PANEL_INFO_TEXT } from '../constants';

	import ControlPanelInfo from '../ControlPanelInfo.svelte';
	import GraphDirectedLinksToggle from './GraphDirectedLinksToggle.svelte';
	import GraphLinkFilters from './GraphLinkFilters.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';
	import GraphNodeFilters from './GraphNodeFilters.svelte';

	type SettingsTabId = 'entities' | 'relationships' | 'fetch';

	let activeTab = $state<SettingsTabId>('entities');
</script>

<div class="flex h-full min-h-0 gap-4">
	<div role="tablist" aria-label="Settings sections" class="control-panel-subtabs">
		<button
			type="button"
			role="tab"
			id="settings-tab-entities"
			class="ui-tab {activeTab === 'entities' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'entities'}
			aria-controls="settings-panel-entities"
			onclick={() => (activeTab = 'entities')}
		>
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot"></span>
				Entities
			</span>
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
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot"></span>
				Relationships
			</span>
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
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot"></span>
				Fetch
			</span>
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
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.settings.entities}>
				<div class="ui-stack text-sm text-gray-400">
					<h4 class="ui-label">Nodes</h4>
					<GraphNodeFilters />
					<h4 class="ui-label">Labels</h4>
					<GraphLabelToggle />
				</div>
			</ControlPanelInfo>
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
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.settings.relationships}>
				<div class="ui-stack text-sm text-gray-400">
					<h4 class="ui-label">Highlight relationships</h4>
					<GraphLinkFilters />
					<h4 class="ui-label">Link style</h4>
					<GraphDirectedLinksToggle />
				</div>
			</ControlPanelInfo>
		</div>
		<div
			role="tabpanel"
			id="settings-panel-fetch"
			aria-labelledby="settings-tab-fetch"
			aria-hidden={activeTab !== 'fetch'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'fetch' ? 'hidden' : ''}"
		>
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.settings.fetch}>
				<p class="text-sm text-gray-500">Fetch and crawl settings will be added in a later phase.</p>
			</ControlPanelInfo>
		</div>
	</div>
</div>
