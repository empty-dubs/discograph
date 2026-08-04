export const NODE_PANEL_ACCORDION_KEY = Symbol('nodePanelAccordion');

export interface NodePanelAccordion {
	readonly openSectionId: string | null;
	toggle: (id: string) => void;
	isOpen: (id: string) => boolean;
}
