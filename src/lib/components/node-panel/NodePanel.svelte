<script lang="ts">
	import { setContext } from 'svelte';

	import NodePanelActions from './NodePanelActions.svelte';
	import NodePanelCollapsibleSection from './NodePanelCollapsibleSection.svelte';
	import NodePanelDetails from './NodePanelDetails.svelte';
	import { NODE_PANEL_ACCORDION_KEY, type NodePanelAccordion } from './accordion';
	import { graphStore } from '$lib/graph/store.svelte';

	const node = $derived(graphStore.selectedNode);

	let openSectionId = $state<string | null>('explore');
	let selectedNodeId = $state<string | null>(null);

	const accordion: NodePanelAccordion = {
		get openSectionId() {
			return openSectionId;
		},
		toggle(id: string) {
			openSectionId = openSectionId === id ? null : id;
		},
		isOpen(id: string) {
			return openSectionId === id;
		}
	};

	setContext(NODE_PANEL_ACCORDION_KEY, accordion);

	$effect(() => {
		const selected = graphStore.selectedNode;

		if (selected?.type === 'artist') {
			graphStore.ensureArtistDetails(selected.id);
		}

		if (selected?.type === 'label') {
			graphStore.ensureLabelDetails(selected.id);
		}
	});

	$effect(() => {
		if (node?.id !== selectedNodeId) {
			selectedNodeId = node?.id ?? null;
			openSectionId = node?.id ? 'explore' : null;
		}
	});
</script>

<aside class="bg-panel h-full min-h-0 overflow-y-auto rounded-lg p-4">
	<h2 class="mb-4 text-base font-semibold">Node details</h2>

	{#if node}
		<NodePanelDetails {node} />

		<NodePanelCollapsibleSection id="explore" title="Explore">
			<NodePanelActions {node} />
		</NodePanelCollapsibleSection>
	{:else}
		<p class="text-muted m-0 text-sm">Click a node in the graph to see its details.</p>
	{/if}
</aside>
