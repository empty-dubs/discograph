<script lang="ts">
	import SearchableListItemButton from '$lib/components/shared/SearchableListItemButton.svelte';
	import SelectedNodeState from '$lib/graph/stores/SelectedNodeState.svelte';
	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodeTypeBadge from './NodeTypeBadge.svelte';

	import type { SearchableListItem } from '$lib/components/shared/types';

	const selected = $derived(SelectedNodeState);
	const node = $derived(SelectedNodeState.data);

	const primaryArtistItem = $derived.by((): SearchableListItem | null => {
		if (!selected.isMasterOrRelease || !node) return null;
		if (!node.artists) return null;

		const first = node.artists[0];

		if (first.id && first?.name?.trim()) {
			return {
				key: String(first.id),
				label: first.name.trim(),
				query: first.name.trim(),
				discogsId: first.id,
				searchType: 'artist'
			};
		}

		return null;
	});

	const showPrimaryArtist = $derived(Boolean(primaryArtistItem));
	const showReleaseTotal = $derived(
		(node!.type === 'artist' || node!.type === 'label' || node!.type === 'master') &&
			SelectedNodeState.releaseTotal !== null
	);
	const releaseTotalLabel = $derived(node!.type === 'master' ? 'Versions' : 'Releases');
	const showYear = $derived(selected.isMasterOrRelease && Boolean(node!.meta?.year));
	const showGenres = $derived(selected.isMasterOrRelease && (node!.meta?.genres?.length ?? 0) > 0);
	const showStyles = $derived(selected.isMasterOrRelease && (node!.meta?.styles?.length ?? 0) > 0);
	const showReleaseYear = $derived(selected.isMasterOrRelease && Boolean(node!.meta?.released) && (String(node!.meta?.released) !== String(node!.meta?.year)));
	const showCountry = $derived(selected.isMasterOrRelease && Boolean(node!.meta?.country));
	const showFormat = $derived(selected.isMasterOrRelease && Boolean(node!.meta?.format));
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodeDetailRow label="Name">{node!.displayName}</NodeDetailRow>
	<NodeTypeBadge/>
	<NodeDetailRow label="Artist" show={showPrimaryArtist}>
		<SearchableListItemButton
			item={primaryArtistItem!}
			class="px-0 py-0.5"
			hasPill={false}
		/>
	</NodeDetailRow>
	<NodeDetailRow label={releaseTotalLabel} show={showReleaseTotal}>
		{SelectedNodeState.releaseTotal!.toLocaleString()}
	</NodeDetailRow>
	<NodeDetailRow label="Year" show={showYear}>{node!.meta?.year}</NodeDetailRow>
	<NodeDetailRow label="Genres" show={showGenres}>{node!.meta?.genres?.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Styles" show={showStyles}>{node!.meta?.styles?.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Released" show={showReleaseYear}>{node!.meta?.released}</NodeDetailRow>
	<NodeDetailRow label="Country" show={showCountry}>{node!.meta?.country}</NodeDetailRow>
	<NodeDetailRow label="Format" show={showFormat}>{node!.meta?.format}</NodeDetailRow>
</dl>
