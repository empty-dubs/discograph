<script lang="ts">
	import { setContext } from 'svelte';

	import { DISCOVER_ENTITIES_ACCORDION_KEY } from '$lib/components/shared/accordion';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { CONTROL_PANEL_HELPER_TEXT } from './constants';

	import type { NodePanelAccordion } from '$lib/components/shared/accordion';

	import ControlPanelCrawl from './ControlPanelCrawl.svelte';
	import ControlPanelRelatedEntities from './ControlPanelRelatedEntities.svelte';
	import ControlPanelExplore from './ControlPanelExplore.svelte';
	import ControlPanelHelperLayout from './ControlPanelHelperLayout.svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	type DiscoverSubTabId = 'crawl' | 'related-entities' | 'explore';

	interface Props {
		isLoading?: boolean;
	}

	let { isLoading = $bindable(false) }: Props = $props();

	let activeTab = $state<DiscoverSubTabId>('explore');
	let openSectionId = $state<string | null>(null);

	const accordion: NodePanelAccordion = {
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

	setContext(DISCOVER_ENTITIES_ACCORDION_KEY, accordion);

	$effect(() => {
		isLoading = selectedNodeState.hasLoadingChildren || crawlState.isRunning;
	});

	$effect(() => {
		selectedNodeState.id;
		openSectionId = null;
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
			id="discover-subtab-explore"
			class="ui-tab {activeTab === 'explore' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'explore'}
			aria-controls="discover-panel-explore"
			onclick={() => (activeTab = 'explore')}
		>
			<span class="inline-flex items-center gap-1.5">
				{#if selectedNodeState.hasLoadingChildren}<LoadingIcon />{/if}
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
			<span class="inline-flex items-center gap-1.5">
				{#if crawlState.isRunning}<LoadingIcon />{/if}
				Crawl
			</span>
		</button>
		<button
			type="button"
			role="tab"
			id="discover-subtab-related-entities"
			class="ui-tab {activeTab === 'related-entities' ? 'ui-tab-active-left' : 'ui-tab-inactive-left'}"
			aria-selected={activeTab === 'related-entities'}
			aria-controls="discover-panel-related-entities"
			onclick={() => (activeTab = 'related-entities')}
		>
			Related
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
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.discover.explore}>
				<ControlPanelExplore />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-crawl"
			aria-labelledby="discover-subtab-crawl"
			aria-hidden={activeTab !== 'crawl'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'crawl' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.discover.crawl}>
				<ControlPanelCrawl />
			</ControlPanelHelperLayout>
		</div>
		<div
			role="tabpanel"
			id="discover-panel-related-entities"
			aria-labelledby="discover-subtab-related-entities"
			aria-hidden={activeTab !== 'related-entities'}
			class="col-start-1 row-start-1 h-full min-h-0 {activeTab !== 'related-entities' ? 'hidden' : ''}"
		>
			<ControlPanelHelperLayout helperText={CONTROL_PANEL_HELPER_TEXT.discover.related}>
				<ControlPanelRelatedEntities />
			</ControlPanelHelperLayout>
		</div>
	</div>
</div>
