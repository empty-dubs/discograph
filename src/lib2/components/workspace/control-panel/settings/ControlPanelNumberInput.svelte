<script lang="ts">
	interface Props {
		id: string;
		label: string;
		min?: number;
		max: number;
		value: number;
		disabled?: boolean;
	}

	let { id, label, min = 1, max, value = $bindable(), disabled = false }: Props = $props();

	function handleInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const parsed = Number.parseInt(input.value, 10);

		if (Number.isNaN(parsed)) {
			value = min;
			return;
		}

		value = Math.min(max, Math.max(min, parsed));
	}
</script>

<div class="ui-stack">
	<label class="ui-label" for={id}>{label}</label>
	<input
		{id}
		type="number"
		class="ui-field w-full"
		{min}
		{max}
		{disabled}
		bind:value
		oninput={handleInput}
	/>
</div>
