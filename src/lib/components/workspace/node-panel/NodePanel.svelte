<script lang="ts">
	import { setContext } from 'svelte';

	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import { NODE_PANEL_ACCORDION_KEY } from '../accordion';
	import type { NodePanelAccordion } from '../accordion';

	import NodePanelDetails from './NodePanelDetails.svelte';

	const node = $derived(selectedNodeState);

	let openSectionId = $state<string | null>(null);

	const accordion: NodePanelAccordion = {
		get openSectionId() {
			return openSectionId;
		},
		toggle(id: string) {
			openSectionId = openSectionId === id ? 'explore' : id;
		},
		isOpen(id: string) {
			return openSectionId === id;
		}
	};

	setContext(NODE_PANEL_ACCORDION_KEY, accordion);

	$effect(() => {
		if (!node.id) return;

		node.ensureDetails();
	});

	$effect(() => {
		openSectionId = node?.id ? 'explore' : null;
	});
</script>

<aside class="bg-panel h-full min-h-0 overflow-y-auto rounded-lg p-4">
	<h2 class="mb-4 text-base font-semibold">Node details</h2>

	{#if node.id}
		<NodePanelDetails/>
	{:else}
		<p class="text-muted m-0 text-sm">Click a node in the graph to see its details.</p>
	{/if}
</aside>
