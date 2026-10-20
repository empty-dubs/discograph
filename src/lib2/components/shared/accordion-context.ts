export const NODE_PANEL_ACCORDION_KEY = Symbol('nodePanelAccordion');
export const RELATED_ENTITIES_ACCORDION_KEY = Symbol('relatedEntitiesAccordion');

export interface Accordion {
	readonly openSectionId: string | null;
	toggle: (id: string) => void;
	isOpen: (id: string) => boolean;
}
