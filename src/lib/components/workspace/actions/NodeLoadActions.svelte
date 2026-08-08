<script lang="ts">
	import { graphStore, graphCtx } from '$lib/graph/store.svelte';
	import { discogsApiStore } from '$lib/discogs/api.svelte';

	import {
		loadRelatedArtists,
		loadRelatedAliases,
		loadRelatedCreditedArtists
	} from '$lib/graph/actions/related-artists';
	import { loadRelatedLabels, loadRelatedCompanies } from '$lib/graph/actions/related-labels';
	import {
		loadReleases,
		loadMasterReleases,
		loadMainRelease
	} from '$lib/graph/actions/releases';

	import { LOAD_ACTIONS } from './constants';

	interface Props {
		nodeId: string;
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { nodeId, layout = 'stack', onAction }: Props = $props();

	const node = $derived(graphStore.nodes.get(nodeId) ?? null);
	const actions = $derived(node ? LOAD_ACTIONS[node.type] : []);

	const itemClass = $derived(
		layout === 'menu'
			? 'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
			: 'border-border bg-panel-hover cursor-pointer rounded-md border px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
	);

	async function run(action: () => Promise<void>) {
		await action();
		onAction?.();
	}
</script>

{#if actions.includes('artists')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedArtists(graphCtx, nodeId))}
	>
		Load related artists
	</button>
{/if}

{#if actions.includes('aliases')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedAliases(graphCtx, nodeId))}
	>
		Load artist aliases
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedLabels(graphCtx, nodeId))}
	>
		Load related labels
	</button>
{/if}

{#if actions.includes('master_releases')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadMasterReleases(graphCtx, nodeId))}
	>
		Load master releases
	</button>
{/if}

{#if actions.includes('releases')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadReleases(graphCtx, nodeId))}
	>
		Load releases
	</button>
{/if}

{#if actions.includes('main_release')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadMainRelease(graphCtx, nodeId))}
	>
		Load main release
	</button>
{/if}

{#if actions.includes('companies')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedCompanies(graphCtx, nodeId))}
	>
		Load related companies
	</button>
{/if}

{#if actions.includes('credited_artists')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedCreditedArtists(graphCtx, nodeId))}
	>
		Load credited artists
	</button>
{/if}
