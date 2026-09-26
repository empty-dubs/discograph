<script lang="ts">
	import { setContext } from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY } from '$lib/components/shared/accordion';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import type { NodePanelAccordion } from '$lib/components/shared/accordion';

	import NodeNavigationActions from '$lib/components/workspace/actions/NodeNavigationActions.svelte';
	import NodePanelDetails from './NodePanelDetails.svelte';

	const node = $derived(selectedNodeState);

	let openSectionId = $state<string | null>(null);
	let lastSelectedId = $state<string | null>(null);

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

		node.fetchDetails();
	});

	$effect(() => {
		node.id;
		openSectionId = null;
	});

	$effect(() => {
		if (!node.id || !node.data) {
			lastSelectedId = null;
			openSectionId = null;
			return;
		}

		const showUrls = node.isArtistOrLabel && (node.data?.urls?.length ?? 0) > 0;
		const showTracklist = node.isMasterOrRelease && (node.data?.tracklist?.length ?? 0) > 0;

		const defaultId = showTracklist
			? 'tracklist'
			: showUrls
				? 'urls'
				: null;

		if (node.id !== lastSelectedId) {
			lastSelectedId = node.id;
			openSectionId = defaultId;
			return;
		}

		if (showTracklist && openSectionId === 'urls') {
			openSectionId = 'tracklist';
			return;
		}

		if (defaultId && openSectionId === null) {
			openSectionId = defaultId;
		}
	});
</script>

<aside class="bg-panel flex h-full min-h-0 flex-col rounded-lg p-4">
	<h2 class="mb-4 shrink-0 font-semibold {node?.id ? 'text-base' : 'text-muted'}">Node details</h2>

	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if node.id}
			<NodePanelDetails />
		{/if}
	</div>

	<div class="border-border/50 mt-3 shrink-0 border-t pt-3">
		{#if node.data}
			<NodeNavigationActions node={node.data} layout="panel"/>
		{/if}
	</div>
</aside>
