<script lang="ts">
	import NodePanelActions from './NodePanelActions.svelte';
	import NodePanelCollapsibleSection from './NodePanelCollapsibleSection.svelte';
	import NodePanelDetails from './NodePanelDetails.svelte';
	import { graphStore } from '$lib/graph/store.svelte';

	const node = $derived(graphStore.selectedNode);

	$effect(() => {
		const selected = graphStore.selectedNode;

		if (selected?.type === 'artist') {
			graphStore.ensureArtistDetails(selected.id);
		}

		if (selected?.type === 'label') {
			graphStore.ensureLabelDetails(selected.id);
		}
	});
</script>

<aside class="bg-panel h-full min-h-0 overflow-y-auto rounded-lg p-4">
	<h2 class="mb-4 text-base font-semibold">Node details</h2>

	{#if node}
		<NodePanelDetails {node} />

		<NodePanelCollapsibleSection title="Explore">
			<NodePanelActions {node} />
		</NodePanelCollapsibleSection>
	{:else}
		<p class="text-muted m-0 text-sm">Click a node in the graph to see its details.</p>
	{/if}
</aside>
