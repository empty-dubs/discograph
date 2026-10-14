<script lang="ts">
	import { runPatchLoadAction } from '../../nexus/discogs/load-runner';
	import { discogsPlugin as discogs } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NodeLoadButton from './NodeLoadButton.svelte';

	import type { LoadType } from'../../plugins/discogs';
	import type { LoadButtonState } from './types';

	interface Props {
		layout?: 'menu' | 'stack';
		buttonVariant?: 'ghost' | 'standard';
	}

	let { layout = 'stack', buttonVariant = 'ghost' }: Props = $props();

	const node = $derived(SelectedNodeState);

	function pagedLoadButtonState(loadType: 'releases' | 'master_releases'): LoadButtonState {
		const loaded = node.hasPagedDocument(loadType);
		const label = loaded
			? `Load more ${loadType === 'master_releases' ? 'master releases' : 'releases'}`
			: discogs.constants.loadTypeLabels[loadType];

		const exhausted = loaded && !node.hasMorePages(loadType);

		return { label, loaded, exhausted };
	}

	$inspect(discogs.loadProgress.pagedDocuments)

	function documentLoadButtonState(loadType: LoadType): LoadButtonState {
		const loaded = node.isLoadTypeCompleted(loadType);
		const label = discogs.constants.loadTypeLabels[loadType];
		const exhausted = loaded;

		return { label, loaded, exhausted };
	}

	function getLoadButtonState(loadType: LoadType): LoadButtonState {
		if (loadType === 'releases') return pagedLoadButtonState('releases');
		if (loadType === 'master_releases') return pagedLoadButtonState('master_releases');

		return documentLoadButtonState(loadType);
	}

	function isButtonDisabled(buttonState: LoadButtonState): boolean {
		if (!node.id || !node.data) return true;
		if (node.isBlocked || node.hasExpansionInFlight || !node.isEntityDocumentLoaded) return true;

		return buttonState.exhausted;
	}

	async function runAction(loadType: LoadType) {
		if (!node.data || node.isBlocked) return;

		const buttonState = getLoadButtonState(loadType);

		if (loadType === 'releases' || loadType === 'master_releases') {
			await runPatchLoadAction(
				node.data,
				loadType,
				buttonState.loaded ? { page: 'next' } : undefined
			);
		} else {
			await runPatchLoadAction(node.data, loadType);
		}
	}
</script>

{#if layout === 'menu'}
	{#each node.neighborTypes as neighborType (neighborType)}
		{const buttonState = $derived(getLoadButtonState(neighborType));}
		<button
			type="button"
			class="ui-list-button"
			disabled={isButtonDisabled(buttonState)}
			onclick={() => runAction(neighborType)}
		>
			{buttonState.label}
		</button>
	{/each}
{:else}
	{#each node.neighborTypes as neighborType (neighborType)}
		{const buttonState = $derived(getLoadButtonState(neighborType));}
		<NodeLoadButton
			variant={buttonVariant}
			disabled={isButtonDisabled(buttonState)}
			onclick={() => runAction(neighborType)}
		>
			{buttonState.label}
		</NodeLoadButton>
	{/each}
{/if}
