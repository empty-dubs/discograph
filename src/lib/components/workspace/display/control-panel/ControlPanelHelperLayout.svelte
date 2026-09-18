<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		helperText: readonly string[];
		helperShare?: 'fixed' | 'half';
		children: Snippet;
	}

	let { helperText, helperShare = 'fixed', children }: Props = $props();
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		class="scrollbar-hidden min-h-0 min-w-0 overflow-y-auto {helperShare === 'half'
			? 'flex-1 basis-0'
			: 'flex-1'}"
	>
		{@render children()}
	</div>
	<aside
		class="ui-helper-column scrollbar-hidden overflow-y-auto {helperShare === 'half'
			? 'min-w-0 flex-1 basis-0'
			: 'w-48 shrink-0 md:w-64'}"
		aria-label="Help"
	>
		{#each helperText as paragraph, index (index)}
			<p class="text-muted m-0 text-sm leading-relaxed">{paragraph}</p>
		{/each}
	</aside>
</div>
