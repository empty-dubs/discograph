import { SvelteSet } from 'svelte/reactivity';

class LoadProgressStore {
	documentsInFlight = $state<SvelteSet<string>>(new SvelteSet());

	isInFlight(id: string): boolean {
		return this.documentsInFlight.has(id);
	}

	async withInFlight<T>(id: string, fn: () => Promise<T>): Promise<T | null> {
		if (this.documentsInFlight.has(id)) return null;

		this.documentsInFlight.add(id);

		try {
			return await fn();
		} finally {
			this.documentsInFlight.delete(id);
		}
	}

	delete(ids: Iterable<string>) {
		for (const id of ids) this.documentsInFlight.delete(id);
	}

	clear() {
		this.documentsInFlight = new SvelteSet();
	}
}

export const loadProgress = new LoadProgressStore();
