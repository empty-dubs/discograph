<script lang="ts">
	import { clearSession, seedFromGraphNode } from '../../../../../nexus/bridge';
	import { graph } from '../../../../../graph/graph';

	import NodeLoadButton from '../../../../shared/NodeLoadButton.svelte';
	import SelectedNodeState from '../../../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);

	const collapseDisabled = $derived(
		!node.isEntityDocumentLoaded
		|| node.isBlocked
		|| !node.hasChildren
		|| node.isLoading
	);

	const resetDisabled = $derived(
		!node.isEntityDocumentLoaded || node.isBlocked || !node.data || node.isLoading
	);

	const clearDisabled = $derived(graph.data.isEmpty || node.isLoading);
</script>

<div class="flex flex-col gap-2" role="group" aria-label="Global graph actions">
	<NodeLoadButton disabled={collapseDisabled} onclick={() => node.collapseNode()}>
		Collapse children
	</NodeLoadButton>

	<NodeLoadButton disabled={resetDisabled} onclick={() => seedFromGraphNode(node.data!)}>
		Reset graph to this node
	</NodeLoadButton>

	<NodeLoadButton disabled={clearDisabled} onclick={() => clearSession()}>
		Clear graph
	</NodeLoadButton>
</div>
