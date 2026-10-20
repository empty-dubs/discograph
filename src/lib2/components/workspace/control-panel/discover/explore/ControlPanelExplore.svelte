<script lang="ts">
	import { discogsPlugin as discogs } from '../../../../../plugins/discogs';

	import NodeLoadActions from '../../../../shared/NodeLoadActions.svelte';
	import ControlPanelExploreSection from './ControlPanelExploreSection.svelte';
	import GraphGlobalActions from './GraphGlobalActions.svelte';
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
	<ControlPanelExploreSection title="Global">
		<GraphGlobalActions />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Artists" nodeTypes={discogs.constants.artistGroups}>
		<NodeLoadActions loadTypes={discogs.constants.artistLoadTypes} />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Masters/Releases" nodeTypes={discogs.constants.masterReleaseGroups}>
		<NodeLoadActions loadTypes={discogs.constants.masterReleaseLoadTypes} />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Labels" nodeTypes={discogs.constants.labelGroups}>
		<NodeLoadActions loadTypes={discogs.constants.labelLoadTypes} />
	</ControlPanelExploreSection>
</div>
