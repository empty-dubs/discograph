<script lang="ts">
	import { NODE_COLORS } from '$lib/graph/constants';

	import {selectedNodeState} from '$lib/graph/stores/SelectedNodeState.svelte';

	const type = $derived(selectedNodeState.node?.type);

</script>

{#if type}
	<dt class="text-muted">Type</dt>
	<dd
		class="type-badge m-0 inline-block rounded px-2 py-0.5 text-sm capitalize"
		style:--badge-color={NODE_COLORS[type]}
	>
			{type}
	</dd>
{/if}

<style>
	.type-badge {
		background: color-mix(in srgb, var(--badge-color) 25%, transparent);
		color: var(--badge-color);
	}
</style>
