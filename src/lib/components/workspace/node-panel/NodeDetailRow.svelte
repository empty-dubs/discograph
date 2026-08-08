<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		show?: boolean;
		children: Snippet;
	}

	let { label, show=true, children }: Props = $props();
</script>

{#if show}
	<dt class="text-muted">{label}</dt>
	<dd class="m-0 text-gray-200">{@render children()}</dd>
{/if}
