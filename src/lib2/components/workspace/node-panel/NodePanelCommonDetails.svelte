<script lang="ts">
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	import SearchableListItemButton from '../../shared/SearchableListItemButton.svelte';
	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodeTypeBadge from './NodeTypeBadge.svelte';

	const node = $derived(SelectedNodeState);
	const entityInfo = $derived(node.entityInfo);
</script>

{const country = $derived(entityInfo?.country)}
{const displayName = $derived(entityInfo?.displayName)}
{const entityType = $derived(entityInfo?.entityType ?? '')}
{const format = $derived(entityInfo?.format)}
{const genres = $derived(entityInfo?.genres ?? [])}
{const primaryArtist = $derived(entityInfo?.primaryArtist)}
{const released = $derived(entityInfo?.released)}
{const releasedYear = $derived(entityInfo?.year)}
{const styles = $derived(entityInfo?.styles ?? [])}
{const year = $derived(entityInfo?.year)}

{const showCountry = $derived(Boolean(country))}
{const showFormat = $derived(Boolean(format))}
{const showGenres = $derived(genres!.length > 0)}
{const showPrimaryArtist = $derived(Boolean(primaryArtist))}
{const showReleaseYear = $derived(Boolean(released) && String(released) !== String(releasedYear))}
{const showStyles = $derived(styles!.length > 0)}
{const showYear = $derived(year != null && year !== '')}

{const releaseListingTotal = $derived(node.releaseListingTotal)}
{const releaseTotalLabel = $derived(entityInfo?.entityType === 'master' ? 'Versions' : 'Releases')}
{const showReleaseTotal = $derived(releaseListingTotal !== null)}

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodeDetailRow label="Name">{displayName}</NodeDetailRow>
	<NodeTypeBadge type={entityType} />
	<NodeDetailRow label="Artist" show={showPrimaryArtist}>
		<SearchableListItemButton item={primaryArtist!} class="px-0 py-0.5" />
	</NodeDetailRow>
	<NodeDetailRow label={releaseTotalLabel} show={showReleaseTotal}>
		{node.releaseListingTotal!.toLocaleString()}
	</NodeDetailRow>
	<NodeDetailRow label="Year" show={showYear}>{year}</NodeDetailRow>
	<NodeDetailRow label="Genres" show={showGenres}>{genres.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Styles" show={showStyles}>{styles.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Released" show={showReleaseYear}>{released}</NodeDetailRow>
	<NodeDetailRow label="Country" show={showCountry}>{country}</NodeDetailRow>
	<NodeDetailRow label="Format" show={showFormat}>{format}</NodeDetailRow>
</dl>
