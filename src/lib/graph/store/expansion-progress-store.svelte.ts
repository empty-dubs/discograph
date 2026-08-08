class ExpansionProgressStore {
	loading = $state<Set<string>>(new Set());
	releasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	masterReleasePages = $state<Map<string, { page: number; pages: number }>>(new Map());

	setLoading(id: string, isLoading: boolean) {
		const next = new Set(this.loading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.loading = next;
	}

	isLoading(nodeId: string): boolean {
		return this.loading.has(nodeId);
	}

	setReleasePages(nodeId: string, page: number, pages: number) {
		this.releasePages = new Map(this.releasePages).set(nodeId, { page, pages });
	}

	setMasterReleasePages(nodeId: string, page: number, pages: number) {
		this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, { page, pages });
	}

	hasMoreReleases(nodeId: string): boolean {
		const paging = this.releasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		const paging = this.masterReleasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	clearNodes(nodeIds: Set<string>) {
		if (nodeIds.size === 0) return;

		const nextReleasePages = new Map(this.releasePages);
		const nextMasterReleasePages = new Map(this.masterReleasePages);

		for (const id of nodeIds) {
			nextReleasePages.delete(id);
			nextMasterReleasePages.delete(id);
		}

		this.releasePages = nextReleasePages;
		this.masterReleasePages = nextMasterReleasePages;
	}

	clear() {
		this.loading = new Set();
		this.releasePages = new Map();
		this.masterReleasePages = new Map();
	}
}

export const expansionProgressStore = new ExpansionProgressStore();
