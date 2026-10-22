import { SvelteMap } from 'svelte/reactivity';

class DocumentStore {
	documents = $state<SvelteMap<string, unknown>>(new SvelteMap());

	get(id: string): unknown {
		return this.documents.get(id);
	}

	set(id: string, document: unknown) {
		const next = new SvelteMap(this.documents);

		next.set(id, document);
		this.documents = next;
	}

	delete(ids: Set<string>) {
		if (ids.size === 0) return;

		const next = new SvelteMap(this.documents);

		for (const id of ids) next.delete(id);

		this.documents = next;
	}

	clear() {
		this.documents = new SvelteMap();
	}
}

export const documentStore = new DocumentStore();
