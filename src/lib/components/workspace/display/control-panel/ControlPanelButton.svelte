<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		pressed?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let { disabled = false, pressed, onclick, children }: Props = $props();

	const buttonClass =
		'font-inherit hover:bg-panel flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-1.5 py-0.5 text-inherit disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';
</script>

<button type="button" class={buttonClass} {disabled} aria-pressed={pressed} {onclick}>
	{@render children()}
</button>
