export const NODE_PANEL_ACCORDION_KEY = Symbol('nodePanelAccordion');
export const DISCOVER_ENTITIES_ACCORDION_KEY = Symbol('discoverEntitiesAccordion');

export interface NodePanelAccordion {
	readonly openSectionId: string | null;
	toggle: (id: string) => void;
	isOpen: (id: string) => boolean;
}
