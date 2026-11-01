class FetchError {
	message = $state<string | null>(null);

	set(message: string | null) {
		this.message = message;
	}

	clear() {
		this.message = null;
	}
}

export const fetchError = new FetchError();
