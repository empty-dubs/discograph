export type FetchOrder = 'year' | 'title';

class ControlPanelSettingsState {
	fetchOrder = $state<FetchOrder>('year');
	fetchCount = $state(100);
}

export const controlPanelSettings = new ControlPanelSettingsState();
