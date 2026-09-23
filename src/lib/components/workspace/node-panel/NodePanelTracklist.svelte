<script lang="ts">
	import { getYouTubeTrackSearchUrl } from '$lib/components/workspace/actions/compositions';

	import type { GraphNode } from '$lib/graph/types';

	type Track = NonNullable<GraphNode['tracklist']>[number];

	interface Props {
		node: GraphNode;
	}

	let { node}: Props = $props();

	function formatTrack(track: Track): string {
		return track.position === ''
		? track.title
		: `${track.position}. ${track.title}${track.duration? ` (${track.duration})`: ''}`;
	}
</script>

<div class="space-y-1">
	{#each node.tracklist ?? [] as track, index ( `${track.position}-${track.title}-${index}` )}
		{@const url = getYouTubeTrackSearchUrl(node, track.title)}
		{#if track.position === '' || !url}
			<span class="block px-0 py-0.5 text-sm text-gray-200">{formatTrack(track)}</span>
		{:else}
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				class="ui-list-button px-0 py-0.5 no-underline"
				title="Search Track on YouTube"
			>
				{formatTrack(track)}
			</a>
		{/if}
	{/each}
</div>
