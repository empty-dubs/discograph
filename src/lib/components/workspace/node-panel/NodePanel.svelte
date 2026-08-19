<script lang="ts">
	import { setContext } from 'svelte';

	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { NODE_PANEL_ACCORDION_KEY, type NodePanelAccordion } from '../accordion';
	import NodePanelDetails from './NodePanelDetails.svelte';
	import NodePanelExplore from './NodePanelExplore.svelte';

	const node = $derived(selectedNodeState);

	let openSectionId = $state<string | null>(null);
	let titleTextColor = $state<string>('text-base');

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
		if (!node.id) return;

		node.fetchNodeDetails();
	});

	$effect(() => {
		node.id;
		openSectionId = null;
	});

	$effect(() => {
		titleTextColor = node?.id ? 'text-base' : 'text-muted';
	});
</script>

<aside class="bg-panel flex h-full min-h-0 flex-col rounded-lg p-4">
	<h2 class="mb-4 shrink-0 font-semibold {titleTextColor}">Node details</h2>

	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if node.id}
			<NodePanelDetails />
		{/if}
	</div>

	<NodePanelExplore />
</aside>
