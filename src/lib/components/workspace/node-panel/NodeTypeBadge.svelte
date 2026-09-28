<script lang="ts">
	import NodeTypePill from '$lib/components/shared/NodeTypePill.svelte';
	import SelectedNodeState from '$lib/stores/SelectedNodeState.svelte';

	const type = $derived(SelectedNodeState.data?.type);
</script>

{#if type}
	<dt class="text-muted">Type</dt>
	<dd class="m-0">
		<NodeTypePill {type} />
	</dd>
{/if}
