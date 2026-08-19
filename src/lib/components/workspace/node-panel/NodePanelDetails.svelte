<script lang="ts">
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { stripDiscogsWikiMarkup } from './transformations';

	import NodePanelCollapsibleSection from './NodePanelCollapsibleSection.svelte';
	import NodePanelCommonDetails from './NodePanelCommonDetails.svelte';
	import NodePanelItemList from './NodePanelItemList.svelte';
	import NodePanelSearchableList from './NodePanelSearchableList.svelte';
	import NodePanelUrls from './NodePanelUrlList.svelte';

	const selected = $derived(selectedNodeState);
	const node = $derived(selected.data);

	const isArtistOrLabel = $derived(node!.type === 'artist' || node!.type === 'label');
	const isMasterOrRelease = $derived(node!.type === 'master' || node!.type === 'release');

	// artist and label
	const showProfile = $derived(isArtistOrLabel && Boolean(node!.profile));
	const showUrls = $derived(isArtistOrLabel && (node!.urls?.length ?? 0) > 0);

	// artist-only
	const showRealName = $derived(node!.type === 'artist' && Boolean(node!.realname));
	const showNameVariations = $derived(
		node!.type === 'artist' && (node!.namevariations?.length ?? 0) > 0
	);
	const showAliases = $derived(node!.type === 'artist' && (node!.aliases?.length ?? 0) > 0);
	const showMembers = $derived(node!.type === 'artist' && (node!.members?.length ?? 0) > 0);
	const showGroups = $derived(node!.type === 'artist' && (node!.groups?.length ?? 0) > 0);

	// label-only
	const showParentLabel = $derived(node!.type === 'label' && Boolean(node!.parent_label));
	const showSublabels = $derived(node!.type === 'label' && (node!.sublabels?.length ?? 0) > 0);

	// master and release
	const showArtists = $derived(isMasterOrRelease && (node!.artists?.length ?? 0) > 0);
	const showTracklist = $derived(isMasterOrRelease && (node!.tracklist?.length ?? 0) > 0);

	// master-only
	const showMainRelease = $derived(node!.type === 'master' && Boolean(node!.main_release_info));

	// release-only
	const showLinkedMaster = $derived(node!.type === 'release' && Boolean(node!.linked_master));
	const showLabels = $derived(node!.type === 'release' && (node!.labels?.length ?? 0) > 0);
	const showCredits = $derived(node!.type === 'release' && (node!.credits?.length ?? 0) > 0);
	const showCompanies = $derived(node!.type === 'release' && (node!.companies?.length ?? 0) > 0);
	const showNotes = $derived(node!.type === 'release' && Boolean(node!.notes));

	function formatMemberName(member: { name: string; active?: boolean }): string {
		return member.active === false ? `${member.name} (inactive)` : member.name;
	}

	function formatProfileText(profile: string): string {
		return profile ? stripDiscogsWikiMarkup(profile) : ''
	}

	function formatTrack(track: { position: string; title: string; duration?: string }): string {
		return `${track.position}. ${track.title}${track.duration ? ` (${track.duration})` : ''}`;
	}

	function buildArtistTitleSearchQuery(title: string | undefined, artistName?: string ): string {
		if (!title) return '';

		const name = artistName?.trim();

		if (!name) return title;

		return `${name} ${title}`;
	}
</script>

<NodePanelCommonDetails/>

{#if selected.isDetailsLoading}
	<p class="text-muted m-0 text-sm">Loading details…</p>
{/if}

{#if selected.isDetailsFailed}
	<p class="text-muted m-0 text-sm">Could not load details.</p>
{/if}

<NodePanelCollapsibleSection id="profile" show={showProfile} title="Profile">
	<div class="text-muted whitespace-pre-wrap text-sm">{formatProfileText(node!.profile ?? '')}</div>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="real-name" show={showRealName} title="Real name">
	{node!.realname}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="name-variations" show={showNameVariations} title="Name variations">
	<NodePanelItemList items={node!.namevariations ?? []} />
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="aliases" show={showAliases} title="Aliases">
	<NodePanelSearchableList
		searchType="artist"
		items={(node!.aliases ?? []).map((alias) => ({
			key: String(alias.id),
			label: alias.name,
			query: alias.name,
			discogsId: alias.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="members" show={showMembers} title="Members">
	<NodePanelSearchableList
		searchType="artist"
		items={(node!.members ?? []).map((member) => ({
			key: String(member.id),
			label: formatMemberName(member),
			query: member.name,
			discogsId: member.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="groups" show={showGroups} title="Groups">
	<NodePanelSearchableList
		searchType="artist"
		items={(node!.groups ?? []).map((group) => ({
			key: String(group.id),
			label: group.name,
			query: group.name,
			discogsId: group.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="parent-label" show={showParentLabel} title="Parent label">
	{#if node!.parent_label}
		<NodePanelSearchableList
			searchType="label"
			items={[{
				key: String(node!.parent_label.id),
				label: node!.parent_label.name,
				query: node!.parent_label.name,
				discogsId: node!.parent_label.id
			}]}
		/>
	{/if}
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="sublabels" show={showSublabels} title="Sublabels">
	<NodePanelSearchableList
		searchType="label"
		items={(node!.sublabels ?? []).map((sublabel) => ({
			key: String(sublabel.id),
			label: sublabel.name,
			query: sublabel.name,
			discogsId: sublabel.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="urls" show={showUrls} title="Links">
	<NodePanelUrls urls={node!.urls ?? []} />
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="main-release" show={showMainRelease} title="Main release">
	<NodePanelSearchableList
		searchType="release"
		items={[{
			key: String(node!.id),
			label: node!.main_release_info?.title,
			query: buildArtistTitleSearchQuery(
				node!.main_release_info?.title,
				node!.main_release_info?.artistName ?? node!.artists?.[0]?.name
			),
			discogsId: node!.main_release_info?.id,
		}]}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="linked-master" show={showLinkedMaster} title="Master">
	<NodePanelSearchableList
		searchType="master"
		items={[{
			key: String(node!.id),
			label: node!.linked_master?.title,
			query: buildArtistTitleSearchQuery(
				node!.linked_master?.title,
				node!.linked_master?.artistName ?? node!.artists?.[0]?.name
			),
		}]}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="artists" show={showArtists} title="Artists">
	<NodePanelSearchableList
		searchType="artist"
		items={(node!.artists ?? []).map((artist) => ({
			key: String(artist.id),
			label: artist.name,
			query: artist.name,
			discogsId: artist.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="labels" show={showLabels} title="Labels">
	<NodePanelSearchableList
		searchType="label"
		items={(node!.labels ?? []).map((label) => ({
			key: `${label.id}-${label.catno ?? ''}`,
			label: label.name,
			query: label.name,
			discogsId: label.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="credits" show={showCredits} title="Credits">
	<NodePanelSearchableList
		searchType="artist"
		items={(node!.credits ?? []).map((credit, index) => ({
			key: `${credit.id}-${credit.role ?? ''}-${index}`,
			label: credit.role ? `${credit.name} — ${credit.role}` : credit.name,
			query: credit.name,
			discogsId: credit.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="companies" show={showCompanies} title="Companies">
	<NodePanelSearchableList
		searchType="label"
		items={(node!.companies ?? []).map((company, index) => ({
			key: `${company.id}-${company.entity_type_name ?? ''}-${index}`,
			label: company.entity_type_name
				? `${company.name} — ${company.entity_type_name}`
				: company.name,
			query: company.name,
			discogsId: company.id
		}))}
	/>
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="tracklist" show={showTracklist} title="Track list">
	<NodePanelItemList items={(node!.tracklist ?? []).map(formatTrack)} />
</NodePanelCollapsibleSection>

<NodePanelCollapsibleSection id="notes" show={showNotes} title="Notes">
	<div class="text-muted whitespace-pre-wrap text-sm">{node!.notes}</div>
</NodePanelCollapsibleSection>
