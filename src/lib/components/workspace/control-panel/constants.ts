export const CONTROL_PANEL_HELPER_TEXT = {
	discover: {
		crawl: [
			'Search for an artist or label above to begin.',
			'Once a node has been selected, select an option to crawl related entities.',
			'artist-artist relationships will crawl to related artists via members, groups, and aliases; label-label relationships will crawl to all related labels.',
			'Select a maximum depth to limit the number of levels of related entities to crawl.',
			'Select Crawl to begin the crawling. Crawling can be stopped at any time.',
			'Note: crawling may take some time to complete, and it will eat into your API quota. To avoid running into a rate limit, the maximum crawl speed has been limited match your rate limit.',
			'Note: more advanced crawl options will be added in the future.'
		],
		explore: [
			'Search for an artist, label, release, or master above to begin.',
			'Once a node has been selected, select an option to add or remove related entities.',
			'Selecting Collapse children will remove all entities related to the selected node from the graph.',
			'Selecting Reset graph to this node will remove all entities apart from the selected node from the graph.',
			'Selecting Clear graph will remove all entities from the graph.'
		],
		related: [
			'Search for an artist, label, release, or master above to begin.',
			'Browse aliases, members, labels, credits, and other related entities for the selected node.',
			'Expand a section to view related entities.',
			'Select a row to view navigation options (reset graph, Discogs, YouTube).'
		],
		releases: [
			'Search for an artist, label, or master above to begin.',
			'Use Load master releases or Load releases to fetch release data.',
			'Select a row to view navigation options (reset graph, Discogs, YouTube).'
		]
	},
	settings: {
		entities: [
			'Enable/disable node visibility and labels on the graph.',
			'Note: the selected node will always be visible.'
		],
		relationships: ['Hover over relationship types to emphasize edges on the graph.'],
		fetch: ['Configure fetch expansion and release loading behavior.']
	}
};
