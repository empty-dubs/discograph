<script lang="ts">
	import { runPatchLoadAction } from '../../nexus/discogs/load-runner';
	import { plugin as source } from '../../plugins/discogs';

	import SelectedNodeState from '../../nexus/discogs/stores/SelectedNodeState.svelte';
	import NodeLoadButton from './NodeLoadButton.svelte';

	import type { LoadType } from '../../plugins/discogs';

	type LoadButtonState = {
		label: string;
		loaded: boolean;
		exhausted: boolean;
		type: string;
	};

	interface Props {
		layout?: 'menu' | 'stack';
		buttonVariant?: 'ghost' | 'standard';
		loadTypes?: LoadType[];
	}

	let {
		layout = 'stack',
		buttonVariant = 'ghost',
		loadTypes
	}: Props = $props();

	const node = $derived(SelectedNodeState);

	function pagedLoadButtonState(loadType: 'releases' | 'master_releases'): LoadButtonState {
		const loaded = node.hasPagedDocument(loadType);
		const label = loaded
			? `Load more ${loadType === 'master_releases' ? 'master releases' : 'releases'}`
			: source.constants.loadTypeLabels[loadType];

		return {
			label,
			loaded,
			exhausted: loaded && !node.hasMorePages(loadType),
			type: loadType
		};
	}

	function documentLoadButtonState(loadType: LoadType): LoadButtonState {
		const loaded = node.isLoadTypeCompleted(loadType);
		const label = source.constants.loadTypeLabels[loadType];

		return { label, loaded, exhausted: loaded, type: loadType };
	}

	function getLoadButtonState(loadType: LoadType): LoadButtonState {
		if (loadType === 'releases') return pagedLoadButtonState('releases');
		if (loadType === 'master_releases') return pagedLoadButtonState('master_releases');

		return documentLoadButtonState(loadType);
	}

	function isButtonDisabled(buttonState: LoadButtonState): boolean {
		if (!node.id || !node.data) return true;
		if (node.isBlocked || node.isLoading || !node.isEntityDocumentLoaded) return true;
		if (!node.neighborTypes.includes(buttonState.type as LoadType)) return true;

		return buttonState.exhausted;
	}

	async function handleClick(buttonState: LoadButtonState) {
		if (!node.data || node.isBlocked) return;

		if (buttonState.type === 'releases' || buttonState.type === 'master_releases') {
			await runPatchLoadAction(
				node.data,
				buttonState.type,
				buttonState.loaded ? { page: 'next' } : undefined
			);
		} else {
			await runPatchLoadAction(node.data, buttonState.type as LoadType);
		}
	}
</script>

{#if layout === 'menu'}
	{#each loadTypes as loadType (loadType)}
		{const buttonState = $derived(getLoadButtonState(loadType));}
		<button
			type="button"
			class="ui-list-button"
			disabled={isButtonDisabled(buttonState)}
			onclick={() => handleClick(buttonState)}
		>
			{buttonState.label}
		</button>
	{/each}
{:else}
	{#each loadTypes as loadType (loadType)}
		{const buttonState = $derived(getLoadButtonState(loadType));}
		<NodeLoadButton
			variant={buttonVariant}
			disabled={isButtonDisabled(buttonState)}
			onclick={() => handleClick(buttonState)}
		>
			{buttonState.label}
		</NodeLoadButton>
	{/each}
{/if}
