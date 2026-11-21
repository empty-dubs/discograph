<script lang="ts">
	import { plugin as source } from '../../../../../plugins/discogs';

	import NodeLoadActions from '../../../../shared/NodeLoadActions.svelte';
	import NavigationList from '../../../../shared/NavigationList.svelte';
	import SelectedNodeState from '../../../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);
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
		{#if !node.attributes}
			<p>Select an artist, label, or master and load masters or releases to begin.</p>
		{:else if !node.hasReleaseParentType}
			<p>Selected node must be an artist, label, or master.</p>
		{:else if node.isLoading && !node.hasReleaseData}
			<p>Loading releases...</p>
		{:else if !node.hasReleaseData}
			<p>Use buttons above to fetch releases.</p>
		{:else}
			<NavigationList items={node.releases} />
		{/if}
	</div>
</div>
