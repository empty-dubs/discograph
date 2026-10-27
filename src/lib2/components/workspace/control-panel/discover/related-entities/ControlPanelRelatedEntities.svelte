<script lang="ts">
	import Accordion from '../../../../shared/Accordion.svelte';
	import SearchableList from '../../../../shared/SearchableList.svelte';
	import SelectedNodeState from '../../../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);
</script>

{#if !node.data || !node.document}
	<p class="text-muted m-0 text-sm">Select a node to browse related entities.</p>
{:else if node.isEntityDocumentLoading}
	<p class="text-muted m-0 text-sm">Loading...</p>
{:else if node.isEntityDocumentFailed}
	<p class="text-muted m-0 text-sm">Failed to load entity data.</p>
{:else if node.relatedEntityGroups.length === 0}
	<p class="text-muted m-0 text-sm">No entity groups for this node.</p>
{:else}
	{#each node.relatedEntityGroups as group (group.id)}
		{const items = $derived(node.relatedEntityItems(group.id))}
		<Accordion
			id={group.id}
			title={group.title}
			count={items.length}
			useRelatedEntitiesAccordion
		>
			<SearchableList {items} />
		</Accordion>
	{/each}
{/if}
