<script lang="ts">
	import { setContext } from 'svelte';

	import { graph } from '$lib/graph/store/graph.svelte';

	import { NODE_PANEL_ACCORDION_KEY } from '../accordion';
	import type { NodePanelAccordion } from '../accordion';

	import NodePanelDetails from './NodePanelDetails.svelte';

	const node = $derived(graph.selectedNode);

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
		const selected = graph.selectedNode;

		if (selected?.type === 'artist') {
			graph.ensureArtistDetails(selected.id);
		}

		if (selected?.type === 'label') {
			graph.ensureLabelDetails(selected.id);
		}

		if (selected?.type === 'master') {
			graph.ensureMasterDetails(selected.id);
		}

		if (selected?.type === 'release') {
			graph.ensureReleaseDetails(selected.id);
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
	{:else}
		<p class="text-muted m-0 text-sm">Click a node in the graph to see its details.</p>
	{/if}
</aside>
