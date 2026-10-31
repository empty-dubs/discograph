import { SvelteMap } from "svelte/reactivity";

class FetchStateStore {
	fetchState = $state<SvelteMap<string, string>>(new SvelteMap());

    get(id: string): string | undefined {
        return this.fetchState.get(id)
    }

    set(id: string, state: string) {
        this.fetchState.set(id, state);
    }

	delete(ids: Iterable<string>) {
		for (const id of ids) this.fetchState.delete(id);
	}

    clear() {
        this.fetchState = new SvelteMap();
    }
}
export const fetchState = new FetchStateStore();
