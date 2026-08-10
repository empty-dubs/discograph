<script lang="ts">
	import DiscogsSearchForm from './DiscogsSearchForm.svelte';
    const headerTextClass = 'mt-1 mb-0 text-sm';
</script>

<header class="flex flex-wrap items-start justify-between gap-4">
    <div>
        <h1 class="m-0 text-2xl font-bold">Discograph</h1>
        <p class="text-muted {headerTextClass}">Explore music relationships from Discogs</p>
    </div>
    <div class="flex-1 max-w-160 min-w-70">
        <DiscogsSearchForm />
    </div>
</header>
