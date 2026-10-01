import { defaultNodePresentation } from '../../graph/presentation';

import type { NodePresentation } from '../../graph/presentation';

interface EntityPresentation {
	id: string;
	label: string;
	color: string;
	radius: number;
	group?: string;
}

interface RelationshipPresentation {
	id: string;
	label: string;
	group?: string;
}

export const graphPresentation = {
	nodes: [
		{ id: 'artist', label: 'Artist', color: '#4a90d9', radius: 14, group: 'artists' },
		{ id: 'label', label: 'Label', color: '#50b86a', radius: 12, group: 'labels' },
		{ id: 'master', label: 'Master', color: '#9b59b6', radius: 11, group: 'masters' },
		{ id: 'release', label: 'Release', color: '#e8943a', radius: 10, group: 'releases' }
	] satisfies EntityPresentation[],
	links: [
		{ id: 'member_of', label: 'Membership', group: 'artists' },
		{ id: 'alias_of', label: 'Aliases', group: 'artists' },
		{ id: 'credited_on', label: 'Credits', group: 'artists' },
		{ id: 'released', label: 'Artist releases', group: 'releases' },
		{ id: 'version_of', label: 'Release versions', group: 'releases' },
		{ id: 'sublabel_of', label: 'Sublabels', group: 'labels' },
		{ id: 'on_label', label: 'Label releases', group: 'labels' },
		{ id: 'company_on', label: 'Companies', group: 'labels' }
	] satisfies RelationshipPresentation[]
};

export function nodePresentation(type: string): NodePresentation {
	const config = graphPresentation.nodes.find((presentation) => presentation.id === type);

	if (config) return { color: config.color, radius: config.radius };

	return defaultNodePresentation;
}
