<script lang="ts">
	import FetchSettingsState from '$lib/stores/FetchSettingsState.svelte';

	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';
</script>

<div class="flex w-full flex-col gap-3 md:w-44" role="group" aria-label="Fetch settings">
	<div class="ui-stack">
		<label class="ui-label" for="fetch-order">Release fetch order</label>
		<select id="fetch-order" class="ui-field w-full" bind:value={FetchSettingsState.fetchOrder}>
			<option value="year">Year</option>
			<option value="title">Title</option>
		</select>
	</div>

	<ControlPanelNumberInput
		id="fetch-count"
		label="Release fetch count"
		max={100}
		bind:value={FetchSettingsState.fetchCount}
	/>
</div>
