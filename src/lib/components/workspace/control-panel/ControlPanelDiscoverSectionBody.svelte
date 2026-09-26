<script lang="ts">
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';
	import { releaseListRowText, releaseTitle } from './transformations';

	import type { DiscoverEntitySectionId } from './control-panel-discover-sections';

	import SearchableList from './SearchableList.svelte';

	interface Props {
		sectionId: DiscoverEntitySectionId;
	}

	let { sectionId }: Props = $props();

	const node = $derived(selectedNodeState.data!);
</script>

{#if sectionId === 'aliases'}
	<SearchableList
		items={(node.aliases ?? []).map((alias) => ({
			key: String(alias.id),
			label: alias.name,
			query: alias.name,
			discogsId: alias.id,
			searchType: 'artist'
		}))}
	/>
{:else if sectionId === 'members'}
	<SearchableList
		items={(node.members ?? []).map((member) => ({
			key: String(member.id),
			label: member.active === false ? `${member.name} (inactive)` : member.name,
			query: member.name,
			discogsId: member.id,
			searchType: 'artist'
		}))}
	/>
{:else if sectionId === 'groups'}
	<SearchableList
		items={(node.groups ?? []).map((group) => ({
			key: String(group.id),
			label: group.name,
			query: group.name,
			discogsId: group.id,
			searchType: 'artist'
		}))}
	/>
{:else if sectionId === 'parent-label'}
	{#if node.parent_label}
		<SearchableList
			items={[{
				key: String(node.parent_label.id),
				label: node.parent_label.name,
				query: node.parent_label.name,
				discogsId: node.parent_label.id,
				searchType: 'label'
			}]}
		/>
	{/if}
{:else if sectionId === 'sublabels'}
	<SearchableList
		items={(node.sublabels ?? []).map((sublabel) => ({
			key: String(sublabel.id),
			label: sublabel.name,
			query: sublabel.name,
			discogsId: sublabel.id,
			searchType: 'label'
		}))}
	/>
{:else if sectionId === 'main-release'}
	<SearchableList
		items={[{
			key: String(node.id),
			label: releaseListRowText(node).label,
			query: releaseTitle(node),
			discogsId: node.main_release_info?.id,
			searchType: 'release',
			artists: node.artists ?? [],
			meta: node.meta ?? {}
		}]}
	/>
{:else if sectionId === 'linked-master'}
	<SearchableList
		items={[{
			key: String(node.id),
			label: releaseListRowText(node).label,
			query: releaseTitle(node),
			discogsId: node.linked_master?.id,
			searchType: 'master',
			artists: node.artists ?? [],
			meta: node.meta ?? {}
		}]}
	/>
{:else if sectionId === 'artists'}
	<SearchableList
		items={(node.artists ?? []).map((artist) => ({
			key: String(artist.id),
			label: artist.name,
			query: artist.name,
			discogsId: artist.id,
			searchType: 'artist'
		}))}
	/>
{:else if sectionId === 'labels'}
	<SearchableList
		items={(node.labels ?? []).map((label) => ({
			key: `${label.id}-${label.catno ?? ''}`,
			label: label.catno ? `${label.name} (${label.catno})` : label.name,
			query: label.name,
			discogsId: label.id,
			searchType: 'label'
		}))}
	/>
{:else if sectionId === 'credits'}
	<SearchableList
		items={(node.credits ?? []).map((credit, index) => ({
			key: `${credit.id}-${credit.role ?? ''}-${index}`,
			label: credit.role ? `${credit.name} — ${credit.role}` : credit.name,
			query: credit.name,
			discogsId: credit.id,
			searchType: 'artist'
		}))}
	/>
{:else if sectionId === 'companies'}
	<SearchableList
		items={(node.companies ?? []).map((company, index) => ({
			key: `${company.id}-${company.entity_type_name ?? ''}-${index}`,
			label: company.entity_type_name && company.catno
				? `${company.name} — ${company.entity_type_name} (${company.catno})`
				: company.entity_type_name
				? `${company.name} — ${company.entity_type_name}`
				: company.catno
				? `${company.name} (${company.catno})`
				: company.name,
			query: company.name,
			discogsId: company.id,
			searchType: 'label'
		}))}
	/>
{/if}
