<script lang="ts">
	import { plugin as source } from '../../../../../plugins/discogs';
	import {
		getReleaseListItems,
		isReleaseParentType
	} from './releases';

	import NodeLoadActions from '../../../../shared/NodeLoadActions.svelte';
	import SearchableList from '../../../../shared/SearchableList.svelte';
	import SelectedNodeState from '../../../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);

	const releaseListItems = $derived(node.data ? getReleaseListItems(node.data) : []);
</script>

<div class="flex h-full min-h-0 flex-col gap-4">
	<div class="flex w-full min-w-0 shrink-0 flex-col gap-2">
		<NodeLoadActions
			loadTypes={source.constants.releasesTabLoadTypes}
			layout="stack"
			buttonVariant="standard"
		/>
	</div>

	<div class="text-muted m-0 min-h-0 flex-1 overflow-y-auto text-sm">
		{#if !node.id || !node.data}
			<p>Select an artist, label, or master and load masters or releases to begin.</p>
		{:else if !isReleaseParentType(node.data.type)}
			<p>Selected node must be an artist, label, or master.</p>
		{:else if node.hasExpansionInFlight && releaseListItems.length === 0}
			<p>Loading releases...</p>
		{:else if releaseListItems.length === 0}
			<p>Use Load master releases or Load releases above to fetch release data.</p>
		{:else}
			<SearchableList items={releaseListItems} />
		{/if}
	</div>
</div>
