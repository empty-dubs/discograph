<script lang="ts">
	import { graph } from '../../graph/graph';
	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';

	$effect(() => {
		const selectedId = graph.presentation.selectedId;

		if (!selectedId) return;

		const node = graph.data.nodes.get(selectedId);

		if (!node) return;

		void SelectedNodeState.loadEntityDocument();
	});
</script>
