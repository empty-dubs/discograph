<script lang="ts">
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);
</script>

{const notes = $derived(node.entityInfo?.notes)}
{const showNotes = $derived(Boolean(notes))}
{const showProfile = $derived(Boolean(node.entityInfo?.profile))}

{#if showProfile}
	<div class="text-muted whitespace-pre-wrap text-sm">
		{#if node.isProfileLoading}
			<p class="text-muted m-0 text-sm">Loading profile…</p>
		{:else if node.isProfileFailed}
			<p class="text-muted m-0 text-sm">Could not load profile.</p>
		{:else}
			{node.profileText}
		{/if}
	</div>
{/if}

{#if showNotes}
	<div class="text-gray-200 whitespace-pre-wrap text-sm">{notes}</div>
{/if}
