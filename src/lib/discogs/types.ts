// export type EntityType = 'artist' | 'label' | 'release' | 'master' | 'track';

export type SearchType = 'artist' | 'label' | 'release' | 'master';

export interface Pagination {
	page: number;
	pages: number;
	per_page: number;
	items: number;
	urls?: {
		first?: string;
		prev?: string;
		next?: string;
		last?: string;
	};
}

export interface SearchResult {
	id: number;
	type: string;
	title?: string;
	name?: string;
	uri?: string;
	resource_url?: string;
	thumb?: string;
	year?: string;
	label?: string[];
}

export interface SearchResponse {
	pagination: Pagination;
	results: SearchResult[];
}

export interface ArtistMember {
	id: number;
	name: string;
	active?: boolean;
	resource_url?: string;
}

export interface ArtistGroup {
	id: number;
	name: string;
	resource_url?: string;
}

export interface Artist {
	id: number;
	name: string;
	realname?: string | null;
	profile?: string;
	uri?: string;
	resource_url?: string;
	releases_url?: string;
	urls?: string[];
	members?: ArtistMember[];
	groups?: ArtistGroup[];
	namevariations?: string[];
}

export interface ArtistRelease {
	id: number;
	title: string;
	type: 'release' | 'master';
	year?: number;
	thumb?: string;
	resource_url?: string;
	main_release?: number;
	artist?: string;
	role?: string;
	label?: string;
}

export interface ArtistReleasesResponse {
	pagination: Pagination;
	releases: ArtistRelease[];
}

export interface LabelRef {
	id: number;
	name: string;
	catno?: string;
	resource_url?: string;
}

export interface Sublabel {
	id: number;
	name: string;
	resource_url?: string;
}

export interface Label {
	id: number;
	name: string;
	profile?: string;
	uri?: string;
	resource_url?: string;
	releases_url?: string;
	urls?: string[];
	sublabels?: Sublabel[];
	parent_label?: LabelRef;
}

export interface LabelRelease {
	id: number;
	title: string;
	year?: string;
	artist?: string;
	resource_url?: string;
	thumb?: string;
}

export interface LabelReleasesResponse {
	pagination: Pagination;
	releases: LabelRelease[];
}

export interface ReleaseArtist {
	id?: number;
	name: string;
	anv?: string;
	join?: string;
	resource_url?: string;
	role?: string;
	tracks?: string;
}

export interface Track {
	position: string;
	title: string;
	duration?: string;
	type_?: string;
}

export interface Release {
	id: number;
	title: string;
	artists?: ReleaseArtist[];
	year?: number;
	released?: string;
	released_formatted?: string;
	uri?: string;
	resource_url?: string;
	labels?: LabelRef[];
	extraartists?: ReleaseArtist[];
	tracklist?: Track[];
	master_id?: number;
	master_url?: string;
	genres?: string[];
	styles?: string[];
}

export interface MasterArtist {
	id: number;
	name: string;
	resource_url?: string;
}

export interface MasterVersion {
	id: number;
	title: string;
	released?: string;
	resource_url?: string;
	thumb?: string;
}

export interface Master {
	id: number;
	title: string;
	year?: number;
	uri?: string;
	resource_url?: string;
	artists?: MasterArtist[];
	genres?: string[];
	styles?: string[];
	versions_url?: string;
	main_release?: number;
}

export interface MasterVersionsResponse {
	pagination: Pagination;
	versions: MasterVersion[];
}

export interface RateLimitInfo {
	limit: number | null;
	used: number | null;
	remaining: number | null;
}
