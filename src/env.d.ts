/// <reference types="@sveltejs/kit" />

declare module '$env/dynamic/private' {
	export const env: {
		DISCOGS_TOKEN?: string;
		DISCOGS_CONSUMER_KEY?: string;
		DISCOGS_CONSUMER_SECRET?: string;
		DISCOGS_USER_AGENT?: string;
	};
}
