<script lang="ts">
	import { plugin as source } from '../../../../../plugins/discogs';

	import NodeLoadActions from '../../../../shared/NodeLoadActions.svelte';
	import ControlPanelExploreSection from './ControlPanelExploreSection.svelte';
	import GraphGlobalActions from './GraphGlobalActions.svelte';
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
	<ControlPanelExploreSection title="Global">
		<GraphGlobalActions />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Artists" entityTypes={source.constants.artistGroups}>
		<NodeLoadActions loadTypes={source.constants.artistLoadTypes} />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Masters/Releases" entityTypes={source.constants.masterReleaseGroups}>
		<NodeLoadActions loadTypes={source.constants.masterReleaseLoadTypes} />
	</ControlPanelExploreSection>

	<ControlPanelExploreSection title="Labels" entityTypes={source.constants.labelGroups}>
		<NodeLoadActions loadTypes={source.constants.labelLoadTypes} />
	</ControlPanelExploreSection>
</div>
