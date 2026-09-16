export type CrawlMode = 'artist-artist' | 'label-label';

class CrawlState {
	mode = $state<CrawlMode>('artist-artist');
	depth = $state(1);
	isRunning = $state(false);
}

export const crawlState = new CrawlState();
