<script lang="ts">
	import Workspace from '$lib/components/workspace/Workspace.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import InsufficientSpaceMessage from '$lib/components/workspace/InsufficientSpaceMessage.svelte';
</script>

<main class="flex h-screen flex-col gap-4 overflow-hidden p-4">
	<Header />
	<div class="hidden min-h-0 flex-1 flex-col md:flex">
		<Workspace />
	</div>
	<div class="flex min-h-0 flex-1 md:hidden">
		<InsufficientSpaceMessage />
	</div>
</main>
