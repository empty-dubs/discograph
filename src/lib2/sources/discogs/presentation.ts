type EntityPresentation = {
	type: string;
	label: string;
	color: string;
	radius: number;
	group: string;
};

type RelationshipPresentation = {
	type: string;
	label: string;
	group: string;
};

export const presentation: {
	entities: Record<string, EntityPresentation>;
	relationships: Record<string, RelationshipPresentation>;
} = {
	entities: {
		artist: { type: 'artist', label: 'Artist', color: '#4a90d9', radius: 14, group: 'artists' },
		label: { type: 'label', label: 'Label', color: '#50b86a', radius: 12, group: 'labels' },
		master: { type: 'master', label: 'Master', color: '#9b59b6', radius: 11, group: 'masters' },
		release: { type: 'release', label: 'Release', color: '#e8943a', radius: 10, group: 'releases' }
	},
	relationships: {
		member_of: { type: 'member_of', label: 'Membership', group: 'artists' },
		alias_of: { type: 'alias_of', label: 'Aliases', group: 'artists' },
		credited_on: { type: 'credited_on', label: 'Credits', group: 'artists' },
		released: { type: 'released', label: 'Artist releases', group: 'releases' },
		version_of: { type: 'version_of', label: 'Release versions', group: 'releases' },
		sublabel_of: { type: 'sublabel_of', label: 'Sublabels', group: 'labels' },
		on_label: { type: 'on_label', label: 'Label releases', group: 'labels' },
		company_on: { type: 'company_on', label: 'Companies', group: 'labels' }
	}
};
