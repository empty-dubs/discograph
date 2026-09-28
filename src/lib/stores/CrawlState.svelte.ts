import type { CrawlMode } from '$lib/components/shared/types';

class CrawlState {
	mode = $state<CrawlMode>('artist-artist');
	depth = $state(1);
	isRunning = $state(false);
	cancelRequested = $state(false);

	beginCrawl() {
		this.cancelRequested = false;
		this.isRunning = true;
	}

	requestStop() {
		if (this.isRunning) this.cancelRequested = true;
	}

	finishCrawl() {
		this.isRunning = false;
		this.cancelRequested = false;
	}
}

export default new CrawlState();
