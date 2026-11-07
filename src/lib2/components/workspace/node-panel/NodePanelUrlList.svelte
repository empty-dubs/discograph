<script lang="ts">
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const entityInfo = $derived(SelectedNodeState.entityInfo);
</script>

{const urls = $derived(entityInfo?.urls ?? []);}
<div class="space-y-1">
	{#each urls as url}
		<a href={url.href} title={url.display} target="_blank" rel="noopener noreferrer" class="text-accent block hover:underline">
			{url.display}
		</a>
	{/each}
</div>
