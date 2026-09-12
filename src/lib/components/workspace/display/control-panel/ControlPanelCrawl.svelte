<script lang="ts">
	import ControlPanelNumberInput from './ControlPanelNumberInput.svelte';

	type CrawlMode = 'artist-artist' | 'label-label';

	let crawlMode = $state<CrawlMode>('artist-artist');
	let depth = $state(1);

	const fieldClass =
		'box-border h-9 w-full rounded-md border border-border bg-panel px-3 text-sm text-gray-200';

	const labelClass = 'text-muted text-xs font-semibold tracking-wide uppercase';

	const buttonClass =
		'box-border h-9 w-full cursor-pointer rounded-md border border-accent bg-accent px-3 text-sm text-white';
</script>

<div class="flex max-w-xs flex-col gap-3" role="group" aria-label="Crawl settings">
	<div class="flex flex-col gap-1.5">
		<label class={labelClass} for="crawl-mode">Mode</label>
		<select id="crawl-mode" class={fieldClass} bind:value={crawlMode}>
			<option value="artist-artist">artist-artist</option>
			<option value="label-label">label-label</option>
		</select>
	</div>

	<ControlPanelNumberInput id="crawl-depth" label="Depth" max={10} bind:value={depth} />

	<button type="button" class={buttonClass}>Crawl</button>
</div>
