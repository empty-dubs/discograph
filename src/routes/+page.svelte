<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import GraphWorkspace from '$lib/components/GraphWorkspace.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<main class="flex h-screen flex-col gap-4 overflow-hidden p-4">
	<Header />
	<GraphWorkspace />
	<Footer />
</main>
