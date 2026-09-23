<script lang="ts">
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { getDiscoverEntitySectionCount, getVisibleEntitySections } from './control-panel-discover-sections';

	import NodePanelCollapsibleSection from '$lib/components/workspace/node-panel/NodePanelCollapsibleSection.svelte';
	import ControlPanelDiscoverSectionBody from './ControlPanelDiscoverSectionBody.svelte';

	const node = $derived(selectedNodeState);
	const visibleSections = $derived(node.data ? getVisibleEntitySections(node.data) : []);
</script>

{#if !node.id || !node.data}
	<p class="text-muted m-0 text-sm">Select a node to browse related entities.</p>
{:else if node.isDetailsLoading}
	<p class="text-muted m-0 text-sm">Loading...</p>
{:else if visibleSections.length === 0}
	<p class="text-muted m-0 text-sm">No entity groups for this node yet.</p>
{:else}
	{#each visibleSections as section (section.id)}
		{@const count = getDiscoverEntitySectionCount(node.data, section.id)}
		<NodePanelCollapsibleSection
			id={section.id}
			title={section.title}
			count={count}
			useDiscoverEntitiesAccordion
		>
			<ControlPanelDiscoverSectionBody sectionId={section.id} />
		</NodePanelCollapsibleSection>
	{/each}
{/if}
