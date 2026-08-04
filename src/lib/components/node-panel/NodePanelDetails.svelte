<script lang="ts">
	import { stripDiscogsWikiMarkup } from '$lib/discogs/format';
	import { graphStore } from '$lib/graph/store.svelte';

	import NodePanelCollapsibleSection from './NodePanelCollapsibleSection.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';
	import NodePanelUrls from './NodePanelUrls.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const isArtistOrLabel = $derived(node.type === 'artist' || node.type === 'label');

	const profileText = $derived(
		isArtistOrLabel && node.profile ? stripDiscogsWikiMarkup(node.profile) : null
	);

	const isProfileLoading = $derived(
		(node.type === 'artist' && graphStore.isArtistDetailsLoading(node.id)) ||
			(node.type === 'label' && graphStore.isLabelDetailsLoading(node.id))
	);

	const showProfile = $derived(isArtistOrLabel && (Boolean(profileText) || isProfileLoading));

	const showRealName = $derived(node.type === 'artist' && Boolean(node.realname));
	const showNameVariations = $derived(
		node.type === 'artist' && (node.namevariations?.length ?? 0) > 0
	);
	const showMembers = $derived(node.type === 'artist' && (node.members?.length ?? 0) > 0);
	const showGroups = $derived(node.type === 'artist' && (node.groups?.length ?? 0) > 0);
	const showParentLabel = $derived(node.type === 'label' && Boolean(node.parent_label));
	const showSublabels = $derived(node.type === 'label' && (node.sublabels?.length ?? 0) > 0);
	const showUrls = $derived(isArtistOrLabel && (node.urls?.length ?? 0) > 0);

	function formatMemberName(member: { name: string; active?: boolean }): string {
		return member.active === false ? `${member.name} (inactive)` : member.name;
	}
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodePanelCommonDetails {node} variant="header" />
</dl>

<NodePanelCollapsibleSection show={showProfile} title="Profile">
	{#if isProfileLoading}
		<p class="text-muted m-0 text-sm">Loading details…</p>
	{/if}
	{#if profileText}
		<div class="text-muted whitespace-pre-wrap text-sm">{profileText}</div>
	{/if}
</NodePanelCollapsibleSection>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodePanelCommonDetails {node} variant="meta" />
</dl>

<NodePanelCollapsibleSection show={showRealName} title="Real name">
	{node.realname}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showNameVariations} title="Name variations">
	{node.namevariations?.join(', ')}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showMembers} title="Members">
	{node.members?.map(formatMemberName).join(', ')}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showGroups} title="Groups">
	{node.groups?.map((group) => group.name).join(', ')}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showParentLabel} title="Parent label">
	{node.parent_label?.name}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showSublabels} title="Sublabels">
	{node.sublabels?.map((sublabel) => sublabel.name).join(', ')}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showUrls} title="Links">
	{#if node.urls}
		<NodePanelUrls urls={node.urls} />
	{/if}
</NodePanelCollapsibleSection>
