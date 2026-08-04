<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<dt class="text-muted">{label}</dt>
<dd class="m-0 text-gray-200">{@render children()}</dd>
