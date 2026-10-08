<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		helperText: readonly string[];
		children: Snippet;
	}

	let { helperText, children }: Props = $props();
</script>

<div class="flex h-full min-h-0 gap-4">
	<div class="min-h-0 min-w-0 flex-[2] basis-0 overflow-y-auto">
		{@render children()}
	</div>
	<aside
		class="ui-helper-column min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto"
		aria-label="Help"
	>
		{#each helperText as paragraph, index (index)}
			<p class="text-muted m-0 pb-2 text-sm leading-relaxed">{paragraph}</p>
		{/each}
	</aside>
</div>
