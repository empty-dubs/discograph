import { documentStore } from './stores/documents.svelte';
import { profileState } from './stores/profile-state.svelte';
import { fetchError } from './stores/fetch-error.svelte';
import { fetchStatus } from './stores/fetch-statuses.svelte';
import { loadProgress } from './stores/load-progress.svelte';
import { pagedDocumentStore } from './stores/paged-documents.svelte';
import { releasesStore } from './stores/releases.svelte';

export function clear() {
	releasesStore.clear();
	pagedDocumentStore.clear();
	fetchStatus.clear();
	fetchError.clear();
	documentStore.clear();
	loadProgress.clear();
	profileState.clear();
}
