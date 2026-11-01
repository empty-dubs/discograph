import { SvelteMap } from 'svelte/reactivity';

import type { EntityDocumentPayload } from '../types';

class DocumentStore {
	documents = $state<SvelteMap<string, EntityDocumentPayload>>(new SvelteMap());

	get(id: string) {
		return this.documents.get(id);
	}

	has(id: string) {
		return this.documents.has(id);
	}

	set(id: string, document: EntityDocumentPayload) {
		const existing = new SvelteMap(this.documents);

		existing.set(id, document);

		this.documents = existing;
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
