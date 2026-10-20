<script lang="ts">
	import { getRelatedEntityCount, getRelatedEntityItems, getRelatedEntityGroups} from './related-entities';

	import Accordion from '../../../../shared/Accordion.svelte';
	import SearchableList from '../../../../shared/SearchableList.svelte';
	import SelectedNodeState from '../../../../../nexus/discogs/stores/SelectedNodeState.svelte';

	import type { EntityType } from '../../../../../plugins/discogs';

	const node = $derived(SelectedNodeState);	

	const relatedEntityGroups = $derived(
		node.data && node.document
			? getRelatedEntityGroups(node.document, node.data.type as EntityType)
			: []
	);
</script>

{#if !node.data || !node.document}
	<p class="text-muted m-0 text-sm">Select a node to browse related entities.</p>
{:else if node.isEntityDocumentLoading}
	<p class="text-muted m-0 text-sm">Loading...</p>
{:else if node.isEntityDocumentFailed}
	<p class="text-muted m-0 text-sm">Failed to load entity data.</p>
{:else if relatedEntityGroups.length === 0}
	<p class="text-muted m-0 text-sm">No entity groups for this node.</p>
{:else}
	{#each relatedEntityGroups as group (group.id)}
		{const count = $derived(getRelatedEntityCount(node.document, group.id))}
		{const items = $derived(getRelatedEntityItems(node.document, node.data!.type as EntityType, group.id));}
		<Accordion
			id={group.id}
			title={group.title}
			{count}
			useRelatedEntitiesAccordion
		>
			<SearchableList {items} />
		</Accordion>
	{/each}
{/if}
