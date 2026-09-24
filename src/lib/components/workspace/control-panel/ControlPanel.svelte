<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown, chevronUp, gear, lightbulbO } from 'svelte-awesome/icons';

	import ControlPanelSettings from './ControlPanelSettings.svelte';
	import ControlPanelDiscover from './ControlPanelDiscover.svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	type TabId = 'discover' | 'settings';

	interface Props {
		isExpanded?: boolean;
	}

	let { isExpanded = $bindable(true) }: Props = $props();

	let activeTab = $state<TabId>('discover');
	let isLoading = $state(false);

	function selectTab(tab: TabId) {
		activeTab = tab;
		isExpanded = true;
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<button
		type="button"
		class="ui-collapse-handle shrink-0"
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
	<div class="flex min-h-0 flex-col {isExpanded ? 'flex-1 gap-4' : ''}">
		<div
			role="tablist"
			aria-label="Control panel sections"
			class="flex shrink-0 gap-1 {isExpanded ? 'border-b border-border' : ''}"
		>
			<button
				type="button"
				role="tab"
				id="control-panel-tab-discover"
				class="ui-tab {activeTab === 'discover' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				aria-selected={activeTab === 'discover'}
				aria-controls="control-panel-panel-discover"
				onclick={() => selectTab('discover')}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						{#if isLoading}
							<LoadingIcon />
						{:else}
							<Icon data={lightbulbO} class="inline-block shrink-0" scale={0.875} />
						{/if}
					</span>
					Discover
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
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={gear} class="inline-block shrink-0" scale={0.875} />
					</span>
					Settings
				</span>
			</button>
		</div>
		<div
			id="control-panel-body"
			class="grid min-h-0 flex-1"
			style:max-height={isExpanded ? '100%' : '0px'}
		>
			<div class="min-h-0 overflow-hidden">
				<div class="grid h-full min-h-0">
					<div
						role="tabpanel"
						id="control-panel-panel-discover"
						aria-labelledby="control-panel-tab-discover"
						aria-hidden={activeTab !== 'discover' || !isExpanded}
						class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'discover' ? 'hidden' : ''}"
					>
						<ControlPanelDiscover bind:isLoading={isLoading} />
					</div>
					<div
						role="tabpanel"
						id="control-panel-panel-settings"
						aria-labelledby="control-panel-tab-settings"
						aria-hidden={activeTab !== 'settings' || !isExpanded}
						class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'settings' ? 'hidden' : ''}"
					>
						<ControlPanelSettings />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
