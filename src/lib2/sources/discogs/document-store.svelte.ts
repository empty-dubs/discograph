class DocumentStore {
	documents = $state<Map<string, unknown>>(new Map());

	get(id: string): unknown {
		return this.documents.get(id);
	}

	set(id: string, document: unknown) {
		const next = new Map(this.documents);

		next.set(id, document);
		this.documents = next;
	}

	delete(ids: Set<string>) {
		if (ids.size === 0) return;

		const next = new Map(this.documents);

		for (const id of ids) next.delete(id);

		this.documents = next;
	}

	clear() {
		this.documents = new Map();
	}
}

export const documentStore = new DocumentStore();
