<script lang="ts">
	import DiscogsSearchForm from '$lib/components/DiscogsSearchForm.svelte';

	import { graphStore } from '$lib/graph/store.svelte';

    const headerTextClass = 'mt-1 mb-0 text-sm';

	const rateLimitText = $derived.by(() => {
		const { limit, remaining } = graphStore.rateLimit;

		if (limit === null || remaining === null) return null;

		return `${remaining}/${limit} API requests remaining`;
	});
</script>

<header class="flex flex-wrap items-start justify-between gap-4">
    <div>
        <h1 class="m-0 text-2xl font-bold">Discograph</h1>
        <p class="text-muted {headerTextClass}">Explore music relationships from Discogs</p>
    </div>

    <div class="flex-1 max-w-160 min-w-70">
        <DiscogsSearchForm />
        {#if rateLimitText}
            <p class="text-muted {headerTextClass}" class:text-warning={graphStore.isRateLimited}>
                {rateLimitText}
            </p>
        {/if}

        {#if graphStore.error}
            <p class="text-danger {headerTextClass}">{graphStore.error}</p>
        {/if}
    </div>
</header>
