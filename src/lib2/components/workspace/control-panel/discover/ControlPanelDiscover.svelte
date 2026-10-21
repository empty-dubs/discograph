<script lang="ts">
	import { setContext } from 'svelte';

	import { RELATED_ENTITIES_ACCORDION_KEY } from '../../../shared/accordion-context';
	import { CONTROL_PANEL_INFO_TEXT } from '../constants';

	import SelectedNodeState from '../../../../nexus/discogs/stores/SelectedNodeState.svelte';
	import ControlPanelInfo from '../ControlPanelInfo.svelte';
	import LoadingIcon from '../LoadingIcon.svelte';
	import ControlPanelExplore from './explore/ControlPanelExplore.svelte';
	import ControlPanelRelatedEntities from './related-entities/ControlPanelRelatedEntities.svelte';
	import ControlPanelReleases from './related-entities/ControlPanelReleases.svelte';

	import type { Accordion } from '../../../shared/accordion-context';

	type DiscoverSubTabId = 'explore' | 'crawl' | 'related-entities' | 'releases';

	let activeTab = $state<DiscoverSubTabId>('explore');
	let openSectionId = $state<string | null>(null);

	const accordion: Accordion = {
		get openSectionId() {
			return openSectionId;
		},
		toggle(id: string) {
			openSectionId = openSectionId === id ? null : id;
		},
		isOpen(id: string) {
			return openSectionId === id;
		}
	};

	setContext(RELATED_ENTITIES_ACCORDION_KEY, accordion);

	$effect(() => {
		SelectedNodeState.id;
		openSectionId = null;
	});
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		role="tablist"
		aria-label="Discover sections"
		class="control-panel-subtabs overflow-y-auto overflow-x-hidden"
	>
		<button
			type="button"
			role="tab"
			id="discover-subtab-explore"
			class="ui-tab {activeTab === 'explore' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'explore'}
			aria-controls="discover-panel-explore"
			onclick={() => (activeTab = 'explore')}
		>
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot">
					{#if SelectedNodeState.hasExpansionInFlight}
						<LoadingIcon />
					{/if}
				</span>
				Explore
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-crawl"
			class="ui-tab {activeTab === 'crawl' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'crawl'}
			aria-controls="discover-panel-crawl"
			onclick={() => (activeTab = 'crawl')}
		>
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot"></span>
				Crawl
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-related-entities"
			class="ui-tab {activeTab === 'related-entities'
				? 'ui-tab-active-left'
				: 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'related-entities'}
			aria-controls="discover-panel-related-entities"
			onclick={() => (activeTab = 'related-entities')}
		>
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot"></span>
				Related
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-releases"
			class="ui-tab {activeTab === 'releases' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'releases'}
			aria-controls="discover-panel-releases"
			onclick={() => (activeTab = 'releases')}
		>
			<span class="control-panel-subtab-inner">
				<span class="control-panel-subtab-icon-slot">
					{#if SelectedNodeState.hasExpansionInFlight}
						<LoadingIcon />
					{/if}
				</span>
				Releases
			</span>
		</button>
	</div>

	<div class="grid min-h-0 min-w-0 flex-1">
		<div
			role="tabpanel"
			id="discover-panel-explore"
			aria-labelledby="discover-subtab-explore"
			aria-hidden={activeTab !== 'explore'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'explore' ? 'hidden' : ''}"
		>
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.discover.explore}>
				<ControlPanelExplore />
			</ControlPanelInfo>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-crawl"
			aria-labelledby="discover-subtab-crawl"
			aria-hidden={activeTab !== 'crawl'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'crawl' ? 'hidden' : ''}"
		>
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.discover.crawl}>
				<p class="text-muted m-0 text-sm">Crawl controls will be added in a later phase.</p>
			</ControlPanelInfo>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-related-entities"
			aria-labelledby="discover-subtab-related-entities"
			aria-hidden={activeTab !== 'related-entities'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'related-entities'
				? 'hidden'
				: ''}"
		>
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.discover.related}>
				<ControlPanelRelatedEntities />
			</ControlPanelInfo>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-releases"
			aria-labelledby="discover-subtab-releases"
			aria-hidden={activeTab !== 'releases'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'releases' ? 'hidden' : ''}"
		>
			<ControlPanelInfo helperText={CONTROL_PANEL_INFO_TEXT.discover.releases}>
				<ControlPanelReleases />
			</ControlPanelInfo>
		</div>
	</div>
</div>
