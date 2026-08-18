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
	main_release?: number;
	name?: string;
	resource_url?: string;
	title?: string;
	type: string;
	uri?: string;
	year?: string;
}

export interface SearchResponse {
	pagination: Pagination;
	results: SearchResult[];
}

interface ArtistMember {
	id: number;
	name: string;
	active?: boolean;
	resource_url?: string;
	uri?: string;
}

interface ArtistGroup {
	id: number;
	name: string;
	resource_url?: string;
	uri?: string;
}

interface ArtistAlias {
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
	aliases?: ArtistAlias[];
	namevariations?: string[];
}

export interface ArtistRelease {
	id: number;
	title: string;
	type: 'release' | 'master';
	year?: number;
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

interface LabelRef {
	id: number;
	name: string;
	catno?: string;
	resource_url?: string;
}

interface Sublabel {
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
	type?: 'release' | 'master';
	year?: string;
	artist?: string;
	resource_url?: string;
	uri?: string;
}

export interface LabelReleasesResponse {
	pagination: Pagination;
	releases: LabelRelease[];
}

interface ReleaseArtist {
	id: number;
	name: string;
	anv?: string;
	join?: string;
	resource_url?: string;
	role?: string;
	tracks?: string;
	uri?: string;
}

interface ReleaseCompany {
	id: number;
	name: string;
	catno?: string;
	entity_type?: string;
	entity_type_name?: string;
	resource_url?: string;
}

export interface ReleaseFormat {
	name: string;
	qty?: string;
	descriptions?: string[];
	text?: string;
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
	companies?: ReleaseCompany[];
	extraartists?: ReleaseArtist[];
	credits?: ReleaseArtist[];
	master_id?: number;
	master_url?: string;
	genres?: string[];
	styles?: string[];
	country?: string;
	notes?: string;
	tracklist?: DiscogsTrack[];
	formats?: ReleaseFormat[];
}

interface DiscogsTrack {
	position: string;
	title: string;
	duration?: string;
}

interface MasterArtist {
	id: number;
	name: string;
	resource_url?: string;
	uri?: string;
}

export interface MasterVersion {
	id: number;
	main_release?: number;
	released?: string;
	resource_url?: string;
	title: string;
	uri?: string;
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
	main_release_url?: string;
	tracklist?: DiscogsTrack[];
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

export type NodePayload =
	| SearchResult
	| Artist
	| Label
	| Release
	| MasterVersion
	| ReleaseArtist
	| LabelRelease
	| ArtistMember
	| ArtistGroup
	| MasterArtist;

export type ArtistNodePayload =
	| SearchResult
	| Artist
	| ReleaseArtist
	| ArtistMember
	| ArtistGroup
	| ArtistAlias
	| MasterArtist;

export type LabelNodePayload =
	| SearchResult
	| Label
	| Sublabel
	| LabelRef
	| ReleaseCompany;

export type MasterNodePayload =
	| SearchResult
	| MasterVersion
	| Master;

export type ReleaseNodePayload =
	| SearchResult
	| Release
	| LabelRelease
	| MasterVersion;
