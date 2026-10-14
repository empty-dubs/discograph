<script lang="ts">
	import NodeLoadActions from '../../shared/NodeLoadActions.svelte';
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';
</script>

<div class="flex h-full min-h-0 flex-col gap-3 overflow-auto p-1">
	{#if !SelectedNodeState.id || !SelectedNodeState.data}
		<p class="text-muted text-sm">Select a node on the graph to load related entities.</p>
	{:else if SelectedNodeState.isBlocked}
		<p class="text-muted text-sm">This entity cannot be expanded.</p>
	{:else}
		<NodeLoadActions />
	{/if}
</div>
