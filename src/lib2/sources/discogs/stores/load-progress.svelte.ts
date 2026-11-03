import { SvelteSet } from 'svelte/reactivity';

class LoadProgressStore {
	documentsInFlight = $state<SvelteSet<string>>(new SvelteSet());

	isInFlight(id: string): boolean {
		return this.documentsInFlight.has(id);
	}

	clear() {
		this.documentsInFlight = new SvelteSet();
	}
}

export const loadProgress = new LoadProgressStore();
