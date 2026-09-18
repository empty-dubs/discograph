<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		pressed?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let { disabled = false, pressed, class: className = '', onclick, children }: Props = $props();
</script>

<button
	type="button"
	class="ui-ghost-button {className}"
	{disabled}
	aria-pressed={pressed}
	{onclick}
>
	{@render children()}
</button>
