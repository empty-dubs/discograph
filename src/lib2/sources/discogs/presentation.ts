export const presentation = {
	entities: [
		{ type: 'artist', label: 'Artist', color: '#4a90d9', radius: 14, group: 'artists' },
		{ type: 'label', label: 'Label', color: '#50b86a', radius: 12, group: 'labels' },
		{ type: 'master', label: 'Master', color: '#9b59b6', radius: 11, group: 'masters' },
		{ type: 'release', label: 'Release', color: '#e8943a', radius: 10, group: 'releases' }
	],
	relationships: [
		{ type: 'member_of', label: 'Membership', group: 'artists' },
		{ type: 'alias_of', label: 'Aliases', group: 'artists' },
		{ type: 'credited_on', label: 'Credits', group: 'artists' },
		{ type: 'released', label: 'Artist releases', group: 'releases' },
		{ type: 'version_of', label: 'Release versions', group: 'releases' },
		{ type: 'sublabel_of', label: 'Sublabels', group: 'labels' },
		{ type: 'on_label', label: 'Label releases', group: 'labels' },
		{ type: 'company_on', label: 'Companies', group: 'labels' }
	]
};
