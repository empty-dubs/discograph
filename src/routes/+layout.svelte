<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Discograph</title>
</svelte:head>

{@render children()}
