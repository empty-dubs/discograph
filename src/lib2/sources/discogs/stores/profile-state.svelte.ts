import { SvelteMap } from 'svelte/reactivity';

export type ProfileStatus = 'idle' | 'loading' | 'fetched' | 'failed';

class ProfileStateStore {
	status = $state<SvelteMap<string, ProfileStatus>>(new SvelteMap());
	text = $state<SvelteMap<string, string>>(new SvelteMap());

	getStatus(id: string): ProfileStatus {
		return this.status.get(id) ?? 'idle';
	}

	getText(id: string): string | undefined {
		return this.text.get(id);
	}

	setLoading(id: string) {
		const nextStatus = new SvelteMap(this.status);

		nextStatus.set(id, 'loading');
		this.status = nextStatus;
	}

	setFetched(id: string, text: string) {
		const nextStatus = new SvelteMap(this.status);
		const nextText = new SvelteMap(this.text);

		nextStatus.set(id, 'fetched');
		nextText.set(id, text);
		this.status = nextStatus;
		this.text = nextText;
	}

	setFailed(id: string) {
		const nextStatus = new SvelteMap(this.status);

		nextStatus.set(id, 'failed');
		this.status = nextStatus;
	}

	delete(ids: Iterable<string>) {
		const nextStatus = new SvelteMap(this.status);
		const nextText = new SvelteMap(this.text);

		for (const id of ids) {
			nextStatus.delete(id);
			nextText.delete(id);
		}

		this.status = nextStatus;
		this.text = nextText;
	}

	clear() {
		this.status = new SvelteMap();
		this.text = new SvelteMap();
	}
}

export const profileState = new ProfileStateStore();
