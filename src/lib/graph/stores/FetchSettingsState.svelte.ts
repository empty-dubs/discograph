type FetchOrder = 'year' | 'title';

class FetchSettingsState {
	fetchOrder = $state<FetchOrder>('year');
	fetchCount = $state(100);
}

export default new FetchSettingsState();
