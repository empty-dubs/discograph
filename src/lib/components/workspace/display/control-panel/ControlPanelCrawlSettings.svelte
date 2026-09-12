<script lang="ts">
	import { controlPanelSettings } from '$lib/graph/stores/ControlPanelSettingsState.svelte';

	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';

	const fieldClass =
		'box-border h-9 w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-gray-200';

	const labelClass = 'text-muted text-xs font-semibold tracking-wide uppercase';
</script>

<div class="flex w-full flex-col gap-3 md:w-44" role="group" aria-label="Fetch settings">
	<div class="flex flex-col gap-1.5">
		<label class={labelClass} for="fetch-order">Release fetch order</label>
		<select
			id="fetch-order"
			class={fieldClass}
			bind:value={controlPanelSettings.fetchOrder}
		>
			<option value="year">Year</option>
			<option value="title">Title</option>
		</select>
	</div>

	<ControlPanelNumberInput
		id="fetch-count"
		label="Release fetch count"
		max={100}
		bind:value={controlPanelSettings.fetchCount}
	/>
</div>
