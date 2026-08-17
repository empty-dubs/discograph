<script lang="ts">
	import { setContext } from 'svelte';

	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { NODE_PANEL_ACCORDION_KEY, type NodePanelAccordion } from '../accordion';
	import NodePanelDetails from './NodePanelDetails.svelte';

	const node = $derived(selectedNodeState);

	let openSectionId = $state<string | null>(null);
	let titleTextColor = $state<string>('text-base');

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

		node.fetchNodeDetails();
	});

	$effect(() => {
		openSectionId = node?.id ? 'explore' : null;
	});

	$effect(() => {
		titleTextColor = node?.id ? 'text-base' : 'text-muted';
	});
</script>

<aside class="bg-panel h-full min-h-0 overflow-y-auto rounded-lg p-4">
	<h2 class="mb-4 font-semibold {titleTextColor}">Node details</h2>

	{#if node.id}
		<NodePanelDetails/>
	{/if}
</aside>
