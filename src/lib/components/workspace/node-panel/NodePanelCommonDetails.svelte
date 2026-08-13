<script lang="ts">
	import NodeDetailRow from './NodeDetailRow.svelte';
	import NodeTypeBadge from './NodeTypeBadge.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const node = $derived(selectedNodeState.node);

	const isMasterOrRelease = $derived(node!.type === 'master' || node!	.type === 'release');
	const showYear = $derived(isMasterOrRelease && Boolean(node!.meta?.year));
	const showGenres = $derived(isMasterOrRelease && (node!.meta?.genres?.length ?? 0) > 0);
	const showStyles = $derived(isMasterOrRelease && (node!.meta?.styles?.length ?? 0) > 0);
	const showReleaseYear = $derived(isMasterOrRelease && Boolean(node!.meta?.released) && (String(node!.meta?.released) !== String(node!.meta?.year)));
	const showCountry = $derived(isMasterOrRelease && Boolean(node!.meta?.country));
	const showFormat = $derived(isMasterOrRelease && Boolean(node!.meta?.format));
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
	<NodeDetailRow label="Name">{node!.displayName}</NodeDetailRow>
	<NodeTypeBadge type={node!.type} />
	<NodeDetailRow label="Year" show={showYear}>{node!.meta?.year}</NodeDetailRow>
	<NodeDetailRow label="Genres" show={showGenres}>{node!.meta?.genres?.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Styles" show={showStyles}>{node!.meta?.styles?.join(', ')}</NodeDetailRow>
	<NodeDetailRow label="Released" show={showReleaseYear}>{node!.meta?.released}</NodeDetailRow>
	<NodeDetailRow label="Country" show={showCountry}>{node!.meta?.country}</NodeDetailRow>
	<NodeDetailRow label="Format" show={showFormat}>{node!.meta?.format}</NodeDetailRow>
</dl>
