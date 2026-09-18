<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		helperText: readonly string[];
		children: Snippet;
	}

	let { helperText, children }: Props = $props();
</script>

<div class="grid min-h-0 grid-cols-[minmax(0,1fr)_12rem] gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
	<div class="min-w-0">
		{@render children()}
	</div>
	<div class="relative min-h-0">
		<aside
			class="ui-helper-column scrollbar-hidden absolute inset-0 flex flex-col gap-2 overflow-y-auto"
			aria-label="Help"
		>
			{#each helperText as paragraph, index (index)}
				<p class="text-muted m-0 text-sm leading-relaxed">{paragraph}</p>
			{/each}
		</aside>
	</div>
</div>
