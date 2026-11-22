type FetchOrder = 'year' | 'title';

class FetchSettings {
	fetchOrder = $state<FetchOrder>('year');
	fetchCount = $state(100);
}

export const fetchSettings = new FetchSettings();
