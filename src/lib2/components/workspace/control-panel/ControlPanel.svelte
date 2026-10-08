<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown, chevronUp, gear } from 'svelte-awesome/icons';

	import ControlPanelSettings from './ControlPanelSettings.svelte';

	interface Props {
		isExpanded?: boolean;
	}

	let { isExpanded = $bindable(true) }: Props = $props();
</script>

<div class="flex h-full min-h-0 flex-col">
	<div class="control-panel-header {isExpanded ? 'border-b border-border' : ''}">
		<button
			type="button"
			class="ui-collapse-handle col-start-1 row-start-1 z-0 w-full min-h-full"
			aria-expanded={isExpanded}
			aria-controls="control-panel-body"
			aria-label={isExpanded ? 'Collapse control panel' : 'Expand control panel'}
			onclick={() => (isExpanded = !isExpanded)}
		>
			{#if isExpanded}
				<Icon data={chevronDown} />
			{:else}
				<Icon data={chevronUp} />
			{/if}
		</button>
		<div
			role="tablist"
			aria-label="Control panel sections"
			class="pointer-events-none col-start-1 row-start-1 z-10 flex items-start gap-1 self-start"
		>
			<button
				type="button"
				role="tab"
				id="control-panel-tab-settings"
				class="ui-tab pointer-events-auto ui-tab-active-bottom"
				aria-selected={true}
				aria-controls="control-panel-panel-settings"
				onclick={() => (isExpanded = true)}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={gear} class="inline-block shrink-0" scale={0.875} />
					</span>
					Settings
				</span>
			</button>
		</div>
	</div>
	<div class="mt-2 flex min-h-0 flex-col {isExpanded ? 'flex-1 gap-4' : ''}">
		<div
			id="control-panel-body"
			class="grid min-h-0 flex-1"
			style:max-height={isExpanded ? '100%' : '0px'}
		>
			<div class="min-h-0 overflow-hidden">
				<div class="grid h-full min-h-0">
					<div
						role="tabpanel"
						id="control-panel-panel-settings"
						aria-labelledby="control-panel-tab-settings"
						aria-hidden={!isExpanded}
						class="col-start-1 row-start-1 h-full min-h-0 {isExpanded ? '' : 'hidden'}"
					>
						<ControlPanelSettings />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
