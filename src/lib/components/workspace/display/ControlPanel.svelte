<script lang="ts">
	import {
		ARTIST_EDGE_TYPES,
		ARTIST_NODE_TYPES,
		LABEL_EDGE_TYPES,
		LABEL_NODE_TYPES,
		MASTER_RELEASE_EDGE_TYPES,
		MASTER_RELEASE_NODE_TYPES
	} from '$lib/graph/constants';

	import {
		ARTIST_LOAD_ACTIONS,
		LABEL_LOAD_ACTIONS,
		MASTER_RELEASE_LOAD_ACTIONS
	} from '$lib/components/workspace/actions/constants';

	import NodeLoadActions from '$lib/components/workspace/actions/NodeLoadActions.svelte';

	import ControlPanelSection from './control-panel/ControlPanelSection.svelte';
	import GraphEdgeFilters from './control-panel/GraphEdgeFilters.svelte';
	import GraphGlobalSettings from './control-panel/GraphGlobalSettings.svelte';
	import GraphNodeFilters from './control-panel/GraphNodeFilters.svelte';
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
	<ControlPanelSection title="Global Settings">
		<GraphGlobalSettings />
	</ControlPanelSection>

	<ControlPanelSection title="Artists" nodeTypes={ARTIST_NODE_TYPES}>
		<GraphNodeFilters types={ARTIST_NODE_TYPES} />
		<GraphEdgeFilters edgeTypes={ARTIST_EDGE_TYPES} />
		<NodeLoadActions showAllActions actionTypes={ARTIST_LOAD_ACTIONS} />
	</ControlPanelSection>

	<ControlPanelSection title="Masters/Releases" nodeTypes={MASTER_RELEASE_NODE_TYPES}>
		<GraphNodeFilters types={MASTER_RELEASE_NODE_TYPES} />
		<GraphEdgeFilters edgeTypes={MASTER_RELEASE_EDGE_TYPES} />
		<NodeLoadActions showAllActions actionTypes={MASTER_RELEASE_LOAD_ACTIONS} />
	</ControlPanelSection>

	<ControlPanelSection title="Labels" nodeTypes={LABEL_NODE_TYPES}>
		<GraphNodeFilters types={LABEL_NODE_TYPES} />
		<GraphEdgeFilters edgeTypes={LABEL_EDGE_TYPES} />
		<NodeLoadActions showAllActions actionTypes={LABEL_LOAD_ACTIONS} />
	</ControlPanelSection>
</div>
