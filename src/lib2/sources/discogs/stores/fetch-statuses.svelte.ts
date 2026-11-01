import { SvelteMap } from "svelte/reactivity";

class FetchStatusStore {
	status = $state<SvelteMap<string, string>>(new SvelteMap());

    get(id: string): string | undefined {
        return this.status.get(id)
    }

    set(id: string, state: string) {
        this.status.set(id, state);
    }

	delete(ids: Iterable<string>) {
		for (const id of ids) this.status.delete(id);
	}

    clear() {
        this.status = new SvelteMap();
    }
}
export const fetchStatus = new FetchStatusStore();
