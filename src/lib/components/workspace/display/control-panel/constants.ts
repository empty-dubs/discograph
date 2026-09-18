export const CONTROL_PANEL_HELPER_TEXT = {
	explore: [
		'Search for an artist, label, release, or master above to begin.',
		'Once a node has been selected, select an option to add or remove related entities.',
		'Selecting Collapse children will remove all entities related to the selected node from the graph.',
		'Selecting Reset graph to this node will remove all entities apart from the selected node from the graph.',
		'Selecting Clear graph will remove all entities from the graph.'
	],
	crawl: [
		'Search for an artist or label above to begin.',
		'Once a node has been selected, select an option to crawl related entities.',
		'artist-artist relationships will crawl to all related artists and label-label relationships will crawl to all related labels.',
		'Select a maximum depth to limit the number of levels of related entities to crawl.',
		'Select Crawl to begin the crawling. Crawling can be stopped at any time.',
		'Note: crawling may take some time to complete, and it will eat into your API quota. To avoid running into a rate limit, the maximum crawl speed has been limited match your rate limit.',
		'Note: more advanced crawl options will be added in the future.'
	],
	settings: {
		nodes: ['Enable/disable node visibility and labels on the graph.'],
		relationships: ['Hover over relationship types to emphasize edges on the graph.'],
		expansion: ['Configure fetch expansion and release loading behavior.']
	}
};
