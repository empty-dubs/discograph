<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		show?: boolean;
		children: Snippet;
	}

	let { title, show = true, children }: Props = $props();
</script>

{#if show}
	<details class="border-border/50 border-b py-1.5 text-sm last:border-b-0">
		<summary class="text-muted cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
			{title}
		</summary>
		<div class="pt-1.5 pb-0.5 text-gray-200">{@render children()}</div>
	</details>
{/if}
