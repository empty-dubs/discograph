<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { github } from 'svelte-awesome/icons';

	import pageLinks from '$lib/data/pageLinks.json';

	import DiscogsSearchForm from './DiscogsSearchForm.svelte';

	const headerTextClass = 'mt-1 mb-0 text-sm';
</script>

<header class="flex flex-wrap items-start gap-4 md:grid md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
	<div class="flex min-w-0 items-end gap-4 md:col-start-1">
		<div class="shrink-0">
			<div class="flex items-center gap-2">
				<h1 class="m-0 text-2xl font-bold">Discograph</h1>
				<a
					href={pageLinks.github}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Discograph on GitHub"
					class="text-muted hover:text-gray-200 shrink-0"
				>
					<Icon data={github} scale={1.25} />
				</a>
			</div>
			<p class="text-muted {headerTextClass}">
				Explore music relationships from
				<a
					href={pageLinks.discogs}
					target="_blank"
					rel="noopener noreferrer"
					class="underline hover:text-gray-200">Discogs</a
				>
			</p>
		</div>

		<DiscogsSearchForm part="input" />
	</div>

	<DiscogsSearchForm part="actions" />
</header>
