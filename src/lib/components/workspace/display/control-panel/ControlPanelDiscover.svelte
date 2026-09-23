<script lang="ts">
	import { setContext } from 'svelte';

	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { DISCOVER_ENTITIES_ACCORDION_KEY } from '../../accordion';
	import { CONTROL_PANEL_HELPER_TEXT } from './constants';

	import type { NodePanelAccordion } from '../../accordion';

	import ControlPanelCrawl from './ControlPanelCrawl.svelte';
	import ControlPanelDiscoverEntities from './ControlPanelDiscoverEntities.svelte';
	import ControlPanelExplore from './ControlPanelExplore.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	type DiscoverSubTabId = 'crawl' | 'entities' | 'explore';

	interface Props {
		isLoading?: boolean;
	}

	let { isLoading = $bindable(false) }: Props = $props();

	let activeDiscoverTab = $state<DiscoverSubTabId>('explore');
	let entitiesOpenSectionId = $state<string | null>(null);

	const entitiesAccordion: NodePanelAccordion = {
		get openSectionId() {
			return entitiesOpenSectionId;
		},
		toggle(id: string) {
			entitiesOpenSectionId = entitiesOpenSectionId === id ? null : id;
		},
		isOpen(id: string) {
			return entitiesOpenSectionId === id;
		}
	};

	setContext(DISCOVER_ENTITIES_ACCORDION_KEY, entitiesAccordion);

	$effect(() => {
		isLoading = selectedNodeState.hasLoadingChildren || crawlState.isRunning;
	});

	$effect(() => {
		selectedNodeState.id;
		entitiesOpenSectionId = null;
	});
</script>

<div class="flex h-full min-h-0 gap-4">
	<div
		role="tablist"
		aria-label="Discover sections"
		class="border-border flex shrink-0 flex-col border-r pr-2"
	>
		<button
			type="button"
			role="tab"
			id="discover-subtab-crawl"
			class="ui-tab {activeDiscoverTab === 'crawl' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeDiscoverTab === 'crawl'}
			aria-controls="discover-panel-crawl"
			onclick={() => (activeDiscoverTab = 'crawl')}
		>
			<span class="inline-flex items-center gap-1.5">
				{#if crawlState.isRunning}<LoadingIcon />{/if}
				Crawl
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-entities"
			class="ui-tab {activeDiscoverTab === 'entities' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeDiscoverTab === 'entities'}
			aria-controls="discover-panel-entities"
			onclick={() => (activeDiscoverTab = 'entities')}
		>
			Entities
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-explore"
			class="ui-tab {activeDiscoverTab === 'explore' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeDiscoverTab === 'explore'}
			aria-controls="discover-panel-explore"
			onclick={() => (activeDiscoverTab = 'explore')}
		>
			<span class="inline-flex items-center gap-1.5">
				{#if selectedNodeState.hasLoadingChildren}<LoadingIcon />{/if}
				Explore
			</span>
		</button>
	</div>

	<div class="grid min-h-0 min-w-0 flex-1">
		<div
			role="tabpanel"
			id="discover-panel-crawl"
			aria-labelledby="discover-subtab-crawl"
			aria-hidden={activeDiscoverTab !== 'crawl'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeDiscoverTab !== 'crawl' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.crawl}>
				<ControlPanelCrawl />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-entities"
			aria-labelledby="discover-subtab-entities"
			aria-hidden={activeDiscoverTab !== 'entities'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeDiscoverTab !== 'entities' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.discover.entities}>
				<ControlPanelDiscoverEntities />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-explore"
			aria-labelledby="discover-subtab-explore"
			aria-hidden={activeDiscoverTab !== 'explore'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeDiscoverTab !== 'explore' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.explore}>
				<ControlPanelExplore />
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
