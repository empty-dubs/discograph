<script lang="ts">
	import CollapsibleSection from '../../shared/CollapsibleSection.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';

	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const entityInfo = $derived(SelectedNodeState.entityInfo);
</script>

<NodePanelCommonDetails />

{const nameVariations = $derived(entityInfo?.namevariations ?? [])}
{const showNameVariations = $derived(nameVariations.length > 0)}

{const realName = $derived(entityInfo?.realname)}
{const showRealName = $derived(Boolean(realName))}

<CollapsibleSection id="real-name" show={showRealName} title="Real name">
	{realName}
</CollapsibleSection>

<CollapsibleSection
	id="name-variations"
	show={showNameVariations}
	title="Name variations"
	count={nameVariations.length}
>
	<div class="space-y-1">
		{#each nameVariations as nameVariation}
			<div class="text-gray-200">{nameVariation}</div>
		{/each}
	</div>
</CollapsibleSection>
