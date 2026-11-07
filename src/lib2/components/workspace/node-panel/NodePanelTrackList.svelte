<script lang="ts">
	import { plugin as source } from '../../../plugins/discogs';

	import type { Track } from '../../../plugins/discogs';

	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const entityInfo = $derived(SelectedNodeState.entityInfo);

	const tracks = $derived(entityInfo?.tracklist ?? []);
	const entityType = $derived(entityInfo?.entityType);
	const artist = $derived(entityInfo?.primaryArtist?.label);
	const year = $derived(entityInfo?.year);

	function trackLabel(track: Track): string {
		return `${track.position ? `${track.position}. ` : ''}${track.title ?? ''}${track.duration ? ` (${track.duration})` : ''}`;
	}

	function trackUrl(trackTitle: string): string | undefined {
		if (!trackTitle) return;

		return source.compositions.getYouTubeSearchUrl({
			query: trackTitle,
			entityType,
			artist,
			year
		});
	}
</script>

<div class="space-y-1">
	{#each tracks as track, index (`${track.position}-${track.title}-${index}`)}
		{const label = $derived(trackLabel(track))}	
		{const url = $derived(trackUrl(track.title))}

		{#if track.position === '' || !url}
			<span class="block px-0 py-0.5 text-sm text-gray-200">{label}</span>
		{:else}
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				class="ui-list-button no-underline gap-0.75 pl-0 border-b border-border"
				title="Search track on YouTube"
			>
				{label}
			</a>
		{/if}
	{/each}
</div>
