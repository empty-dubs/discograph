<script lang="ts">
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import NodeTypePill from '$lib/components/shared/NodeTypePill.svelte';

	const type = $derived(selectedNodeState.data?.type);
</script>

{#if type}
	<dt class="text-muted">Type</dt>
	<dd class="m-0">
		<NodeTypePill {type} class="px-2 py-0.5 text-sm" />
	</dd>
{/if}
