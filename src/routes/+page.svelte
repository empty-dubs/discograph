<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import GraphWorkspace from '$lib/components/graph/GraphWorkspace.svelte';
	import Header from '$lib/components/layout/Header.svelte';
</script>

<main class="flex h-screen flex-col gap-4 overflow-hidden p-4">
	<Header />
	<GraphWorkspace />
	<Footer />
</main>
