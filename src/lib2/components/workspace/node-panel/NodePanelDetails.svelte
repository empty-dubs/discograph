<script lang="ts">
	import { getContext } from 'svelte';

	import { Icon } from 'svelte-awesome';
	import { fileText, infoCircle, link, list } from 'svelte-awesome/icons';

	import { NODE_PANEL_ACCORDION_KEY } from '../../shared/accordion-context';

	import NodePanelInfo from './NodePanelInfo.svelte';
	import NodePanelNotes from './NodePanelNotes.svelte';
	import NodePanelTrackList from './NodePanelTrackList.svelte';
	import NodePanelUrlList from './NodePanelUrlList.svelte';

	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	import type { Accordion } from '../../shared/accordion-context';

	type TabId = 'info' | 'notes' | 'links' | 'tracks';

	const accordion = getContext<Accordion>(NODE_PANEL_ACCORDION_KEY);

	const node = $derived(SelectedNodeState);
	const entityInfo = $derived(node.entityInfo);

	const notes = $derived(entityInfo?.notes);
	const profile = $derived(entityInfo?.profile);
	const tracks = $derived(entityInfo?.tracklist ?? []);
	const urls = $derived(entityInfo?.urls ?? []);

	const showNotes = $derived(Boolean(notes));
	const showProfile = $derived(Boolean(profile));
	const showTracks = $derived(tracks.length > 0);
	const showUrls = $derived(urls.length > 0);

	const showLinksTab = $derived(showUrls);
	const showNotesTab = $derived(showProfile || showNotes);
	const showTracksTab = $derived(showTracks);

	const visibleTabIds = $derived.by((): TabId[] => {
		const tabs: TabId[] = [];

		if (entityInfo) tabs.push('info');
		if (showLinksTab) tabs.push('links');
		if (showNotesTab) tabs.push('notes');
		if (showTracksTab) tabs.push('tracks');

		return tabs;
	});

	let activeTab = $state<TabId>('info');

	function selectTab(id: TabId) {
		activeTab = id;
		accordion.setOpenSectionId?.(null);
	}

	$effect(() => {
		node.id;
		activeTab = 'info';
	});

	$effect(() => {
		if (!visibleTabIds.includes(activeTab)) {
			activeTab = visibleTabIds[0] ?? 'info';
		}
	});

	$effect(() => {
		if (activeTab !== 'notes' || !showProfile || node.isEntityDocumentLoading) return;

		void node.fetchProfile();
	});
</script>

{#if node.isEntityDocumentLoading && !entityInfo}
	<p class="text-muted m-0 text-sm">Loading node information...</p>
{:else if node.isEntityDocumentFailed}
	<p class="text-muted m-0 text-sm">Could not load information.</p>
{:else if !node.isEntityDocumentLoaded}
	<p class="text-muted m-0 text-sm">Select a node to view information.</p>
{:else}
	<div
		class="border-border bg-panel sticky top-0 z-10 -mx-1 mb-2 shrink-0 border-b px-1 {visibleTabIds.length > 1
			? 'flex items-start gap-1'
			: ''}"
		role="tablist"
		aria-label="Node details sections"
		aria-orientation="horizontal"
	>
		{#if entityInfo}
			<button
				type="button"
				role="tab"
				id="node-panel-tab-trigger-info"
				aria-selected={activeTab === 'info'}
				aria-controls="node-panel-tab-panel-info"
				tabindex={activeTab === 'info' ? 0 : -1}
				title="Info"
				class="ui-tab {activeTab === 'info' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				onclick={() => selectTab('info')}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={infoCircle} class="inline-block shrink-0" scale={0.875} />
					</span>
					Info
				</span>
			</button>
		{/if}
		{#if showTracksTab}
			<button
				type="button"
				role="tab"
				id="node-panel-tab-trigger-tracks"
				aria-selected={activeTab === 'tracks'}
				aria-controls="node-panel-tab-panel-tracks"
				tabindex={activeTab === 'tracks' ? 0 : -1}
				title="Tracks"
				class="ui-tab {activeTab === 'tracks' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				onclick={() => selectTab('tracks')}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={list} class="inline-block shrink-0" scale={0.875} />
					</span>
					Tracks
				</span>
			</button>
		{/if}
		{#if showNotesTab}
			<button
				type="button"
				role="tab"
				id="node-panel-tab-trigger-notes"
				aria-selected={activeTab === 'notes'}
				aria-controls="node-panel-tab-panel-notes"
				tabindex={activeTab === 'notes' ? 0 : -1}
				title="Notes"
				class="ui-tab {activeTab === 'notes'
					? 'ui-tab-active-bottom'
					: 'ui-tab-inactive-bottom'}"
				onclick={() => selectTab('notes')}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={fileText} class="inline-block shrink-0" scale={0.875} />
					</span>
					Notes
				</span>
			</button>
		{/if}
		{#if showLinksTab}
			<button
				type="button"
				role="tab"
				id="node-panel-tab-trigger-links"
				aria-selected={activeTab === 'links'}
				aria-controls="node-panel-tab-panel-links"
				tabindex={activeTab === 'links' ? 0 : -1}
				title="Links"
				class="ui-tab {activeTab === 'links' ? 'ui-tab-active-bottom' : 'ui-tab-inactive-bottom'}"
				onclick={() => selectTab('links')}
			>
				<span class="control-panel-subtab-inner">
					<span class="control-panel-subtab-icon-slot">
						<Icon data={link} class="inline-block shrink-0" scale={0.875} />
					</span>
					Links
				</span>
			</button>
		{/if}
	</div>

	{#if activeTab === 'info' && entityInfo}
		<div
			id="node-panel-tab-panel-info"
			role="tabpanel"
			aria-labelledby="node-panel-tab-trigger-info"
			tabindex="0"
		>
			<NodePanelInfo/>
		</div>
	{/if}

	{#if activeTab === 'tracks' && showTracksTab && entityInfo}
		<div
			id="node-panel-tab-panel-tracks"
			role="tabpanel"
			aria-labelledby="node-panel-tab-trigger-tracks"
			tabindex="0"
		>
			<NodePanelTrackList/>
		</div>
	{/if}

	{#if activeTab === 'notes' && showNotesTab}
		<div
			id="node-panel-tab-panel-notes"
			role="tabpanel"
			aria-labelledby="node-panel-tab-trigger-notes"
			tabindex="0"
		>
			<NodePanelNotes />
		</div>
	{/if}

	{#if activeTab === 'links' && showLinksTab}
		<div
			id="node-panel-tab-panel-links"
			role="tabpanel"
			aria-labelledby="node-panel-tab-trigger-links"
			tabindex="0"
		>
			<NodePanelUrlList/>
		</div>
	{/if}
{/if}
