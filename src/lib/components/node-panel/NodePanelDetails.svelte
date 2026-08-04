<script lang="ts">
	import { stripDiscogsWikiMarkup } from '$lib/discogs/format';
	import { graphStore } from '$lib/graph/store.svelte';

	import NodePanelCollapsibleSection from './NodePanelCollapsibleSection.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';
	import NodePanelSearchableList from './NodePanelSearchableList.svelte';
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
	<NodePanelSearchableList
		searchType="artist"
		items={(node.namevariations ?? []).map((name) => ({ label: name, query: name }))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showMembers} title="Members">
	<NodePanelSearchableList
		searchType="artist"
		items={(node.members ?? []).map((member) => ({
			label: formatMemberName(member),
			query: member.name
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showGroups} title="Groups">
	<NodePanelSearchableList
		searchType="artist"
		items={(node.groups ?? []).map((group) => ({ label: group.name, query: group.name }))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showParentLabel} title="Parent label">
	{#if node.parent_label}
		<NodePanelSearchableList
			searchType="label"
			items={[{ label: node.parent_label.name, query: node.parent_label.name }]}
		/>
	{/if}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showSublabels} title="Sublabels">
	<NodePanelSearchableList
		searchType="label"
		items={(node.sublabels ?? []).map((sublabel) => ({
			label: sublabel.name,
			query: sublabel.name
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection show={showUrls} title="Links">
	{#if node.urls}
		<NodePanelUrls urls={node.urls} />
	{/if}
</NodePanelCollapsibleSection>
