<script lang="ts">
	import { setContext } from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY } from '../../shared/accordion-context';
	import NavigationActions from '../../shared/NavigationActions.svelte';
	import NodePanelDetails from './NodePanelDetails.svelte';
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	import type { Accordion } from '../../shared/accordion-context';

	const node = $derived(SelectedNodeState);

	let openSectionId = $state<string | null>(null);

	const accordion: Accordion = {
		get openSectionId() {
			return openSectionId;
		},
		toggle(id: string) {
			openSectionId = openSectionId === id ? null : id;
		},
		isOpen(id: string) {
			return openSectionId === id;
		},
		setOpenSectionId(id: string | null) {
			openSectionId = id;
		}
	};

	setContext(NODE_PANEL_ACCORDION_KEY, accordion);
</script>

<aside class="bg-panel flex h-full min-h-0 flex-col rounded-lg p-4">
	{#if node.id}
		<div class="min-h-0 flex-1 overflow-y-auto">
			<NodePanelDetails />
		</div>
	{/if}

	{#if node.navigationItem}
		<div class="border-border/50 mt-3 shrink-0 border-t pt-3">
			<NavigationActions item={node.navigationItem} layout="panel" />
		</div>
	{/if}
</aside>
