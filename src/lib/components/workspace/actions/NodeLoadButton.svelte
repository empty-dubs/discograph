<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		pressed?: boolean;
		variant?: 'ghost' | 'standard';
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let {
		disabled = false,
		pressed,
		variant = 'ghost',
		class: className = '',
		onclick,
		children
	}: Props = $props();
</script>

<button
	type="button"
	class={
		variant === 'standard'
		? `ui-button ${className}`
		: `ui-ghost-button ${className}`
	}
	{disabled}
	aria-pressed={pressed}
	{onclick}
>
	{@render children()}
</button>
