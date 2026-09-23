<script lang="ts">
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { buildArtistTitleSearchQuery, formatMemberName} from './control-panel-discover-sections';

	import type { DiscoverEntitySectionId } from './control-panel-discover-sections';

	import NodePanelSearchableList from '$lib/components/workspace/node-panel/NodePanelSearchableList.svelte';

	interface Props {
		sectionId: DiscoverEntitySectionId;
	}

	let { sectionId }: Props = $props();

	const node = $derived(selectedNodeState.data!);
</script>

{#if sectionId === 'aliases'}
	<NodePanelSearchableList
		searchType="artist"
		items={(node.aliases ?? []).map((alias) => ({
			key: String(alias.id),
			label: alias.name,
			query: alias.name,
			discogsId: alias.id
		}))}
	/>
{:else if sectionId === 'members'}
	<NodePanelSearchableList
		searchType="artist"
		items={(node.members ?? []).map((member) => ({
			key: String(member.id),
			label: formatMemberName(member),
			query: member.name,
			discogsId: member.id
		}))}
	/>
{:else if sectionId === 'groups'}
	<NodePanelSearchableList
		searchType="artist"
		items={(node.groups ?? []).map((group) => ({
			key: String(group.id),
			label: group.name,
			query: group.name,
			discogsId: group.id
		}))}
	/>
{:else if sectionId === 'parent-label'}
	{#if node.parent_label}
		<NodePanelSearchableList
			searchType="label"
			items={[{
				key: String(node.parent_label.id),
				label: node.parent_label.name,
				query: node.parent_label.name,
				discogsId: node.parent_label.id
			}]}
		/>
	{/if}
{:else if sectionId === 'sublabels'}
	<NodePanelSearchableList
		searchType="label"
		items={(node.sublabels ?? []).map((sublabel) => ({
			key: String(sublabel.id),
			label: sublabel.name,
			query: sublabel.name,
			discogsId: sublabel.id
		}))}
	/>
{:else if sectionId === 'main-release'}
	<NodePanelSearchableList
		searchType="release"
		items={[{
			key: String(node.id),
			label: node.main_release_info?.title,
			query: buildArtistTitleSearchQuery(
				node.main_release_info?.title,
				node.main_release_info?.artistName ?? node.artists?.[0]?.name
			),
			discogsId: node.main_release_info?.id,
		}]}
	/>
{:else if sectionId === 'linked-master'}
	<NodePanelSearchableList
		searchType="master"
		items={[{
			key: String(node.id),
			label: node.linked_master?.title,
			query: buildArtistTitleSearchQuery(
				node.linked_master?.title,
				node.linked_master?.artistName ?? node.artists?.[0]?.name
			),
		}]}
	/>
{:else if sectionId === 'artists'}
	<NodePanelSearchableList
		searchType="artist"
		items={(node.artists ?? []).map((artist) => ({
			key: String(artist.id),
			label: artist.name,
			query: artist.name,
			discogsId: artist.id
		}))}
	/>
{:else if sectionId === 'labels'}
	<NodePanelSearchableList
		searchType="label"
		items={(node.labels ?? []).map((label) => ({
			key: `${label.id}-${label.catno ?? ''}`,
			label: label.name,
			query: label.name,
			discogsId: label.id
		}))}
	/>
{:else if sectionId === 'credits'}
	<NodePanelSearchableList
		searchType="artist"
		items={(node.credits ?? []).map((credit, index) => ({
			key: `${credit.id}-${credit.role ?? ''}-${index}`,
			label: credit.role ? `${credit.name} — ${credit.role}` : credit.name,
			query: credit.name,
			discogsId: credit.id
		}))}
	/>
{:else if sectionId === 'companies'}
	<NodePanelSearchableList
		searchType="label"
		items={(node.companies ?? []).map((company, index) => ({
			key: `${company.id}-${company.entity_type_name ?? ''}-${index}`,
			label: company.entity_type_name
				? `${company.name} — ${company.entity_type_name}`
				: company.name,
			query: company.name,
			discogsId: company.id
		}))}
	/>
{/if}
