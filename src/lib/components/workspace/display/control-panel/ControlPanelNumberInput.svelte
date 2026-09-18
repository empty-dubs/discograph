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

	const fieldClass =
		'box-border h-9 w-full rounded-md border border-border bg-panel px-3 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50';

	const labelClass = 'text-muted text-xs font-semibold tracking-wide uppercase';

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

<div class="flex flex-col gap-1.5">
	<label class={labelClass} for={id}>{label}</label>
	<input
		{id}
		type="number"
		class={fieldClass}
		{min}
		{max}
		{disabled}
		bind:value
		oninput={handleInput}
	/>
</div>
