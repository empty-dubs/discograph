<script lang="ts">
	import { getContext } from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY } from '$lib/components/shared/accordion';

	import type { NodePanelAccordion } from '$lib/components/shared/accordion';
	
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import CollapsibleSection from '$lib/components/shared/CollapsibleSection.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';
	import NodePanelItemList from './NodePanelItemList.svelte';
	import NodePanelTracklist from './NodePanelTracklist.svelte';
	import NodePanelUrlList from './NodePanelUrlList.svelte';

	const selected = $derived(selectedNodeState);
	const node = $derived(selected.data);
	const accordion = getContext<NodePanelAccordion>(NODE_PANEL_ACCORDION_KEY);
	const profileOpen = $derived(accordion.openSectionId === 'profile');

	// artist and label
	const showProfile = $derived(selected.isArtistOrLabel && Boolean(node!.profile));
	const showUrls = $derived(selected.isArtistOrLabel && (node!.urls?.length ?? 0) > 0);

	// artist-only
	const showRealName = $derived(node!.type === 'artist' && Boolean(node!.realname));
	const showNameVariations = $derived(
		node!.type === 'artist' && (node!.namevariations?.length ?? 0) > 0
	);

	// master and release
	const showTracklist = $derived(selected.isMasterOrRelease && (node!.tracklist?.length ?? 0) > 0);

	// release-only
	const showNotes = $derived(node!.type === 'release' && Boolean(node!.notes));

	$effect(() => {
		if (!profileOpen || !showProfile || selected.isDetailsLoading) return;

		selected.fetchProfile();
	});
</script>

<NodePanelCommonDetails/>

{#if selected.isDetailsLoading}
	<p class="text-muted m-0 text-sm">Loading details…</p>
{/if}

{#if selected.isDetailsFailed}
	<p class="text-muted m-0 text-sm">Could not load details.</p>
{/if}

<CollapsibleSection id="profile" show={showProfile} title="Profile">
	<div class="text-muted whitespace-pre-wrap text-sm" class:loading={selected.isDetailsLoading}>
		{#if selected.isProfileLoading}
			<p class="text-muted m-0 text-sm">Loading profile…</p>
		{:else if selected.isProfileFailed}
			<p class="text-muted m-0 text-sm">Could not load profile.</p>
		{:else}
			{node!.profile}
		{/if}
	</div>
</CollapsibleSection>

<CollapsibleSection id="real-name" show={showRealName} title="Real name">
	{node!.realname}
</CollapsibleSection>

<CollapsibleSection id="name-variations" show={showNameVariations} title="Name variations" count={node!.namevariations?.length}>
	<NodePanelItemList items={node!.namevariations ?? []} />
</CollapsibleSection>

<CollapsibleSection id="urls" show={showUrls} title="Links" count={node!.urls?.length}>
	<NodePanelUrlList urls={node!.urls ?? []} />
</CollapsibleSection>

<CollapsibleSection id="notes" show={showNotes} title="Notes">
	<div class="text-muted whitespace-pre-wrap text-sm">{node!.notes}</div>
</CollapsibleSection>

<CollapsibleSection id="tracklist" show={showTracklist} title="Track list" count={node!.tracklist?.length}>
	<NodePanelTracklist node={node!} />
</CollapsibleSection>
