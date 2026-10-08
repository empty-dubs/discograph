<script lang="ts">
	import { CONTROL_PANEL_INFO_TEXT } from './constants';

	import ControlPanelInfo from './ControlPanelInfo.svelte';
	import GraphLabelToggle from './GraphLabelToggle.svelte';

	type SettingsTabId = 'entities';

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
					<h4 class="ui-label">Labels</h4>
					<GraphLabelToggle />
				</div>
			</ControlPanelInfo>
		</div>
	</div>
</div>
