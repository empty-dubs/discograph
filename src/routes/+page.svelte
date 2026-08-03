<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import GraphCanvas from '$lib/components/GraphCanvas.svelte';
	import Header from '$lib/components/Header.svelte';
	import NodePanel from '$lib/components/NodePanel.svelte';
</script>

<main class="flex min-h-screen flex-col gap-4 p-4">
	<Header />

	<section class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
		<div class="h-[50vh] min-h-[400px] md:h-[calc(100vh-220px)]">
			<GraphCanvas/>
		</div>
		<NodePanel />
	</section>

	<Footer />
</main>
