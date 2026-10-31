import { SvelteMap } from "svelte/reactivity";

class PatchStateStore {
    patchState = $state<SvelteMap<string, SvelteMap<string, number>>>(new SvelteMap());

    get(id: string): Map<string, number> | undefined {
        return this.patchState.get(id)
    }

    update(id: string, patchType: string) {
        const entityPatchState = this.patchState.get(id) ?? new SvelteMap();

        if (entityPatchState.has(patchType)) {
            entityPatchState.set(patchType, (entityPatchState.get(patchType) ?? 0) + 1);
        } else {
            entityPatchState.set(patchType, 1);
        }

        this.patchState.set(id, entityPatchState);
    }

    delete(ids: Iterable<string>) {
        for (const id of ids) this.patchState.delete(id);
    }

    clear() {
        this.patchState = new SvelteMap();
    }
}
export const patchState = new PatchStateStore();
