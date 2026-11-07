import { getDiscogsWebsiteUrl, getEntityDisplayName, getEntityId } from '../compositions';
import { presentation } from '../presentation';
import { parseDiscogsExternalUrl } from '../wiki-markup';

import type { EntityInformation } from '../types';

import type {
	Artist,
	EntityDocument,
	EntityType,
	Label,
	Master,
	Release,
    ReleaseFormat,
	SearchableListItem
} from '../types';

function entityTypeLabel(entityType: EntityType): string {
	return presentation.entities[entityType]?.label ?? entityType;
}

function formatReleaseFormats(formats?: ReleaseFormat[]): string | undefined {
	if (!formats?.length) return;

	return formats
		.map((format) => {
			// filter join non-empty format descriptions, separated by comma
			// the Boolean filter is used to remove undefined and null values
			const descriptions = format.descriptions?.filter(Boolean).join(', ');

			return descriptions ? `${format.name} (${descriptions})` : format.name;
		})
		.join(', ');
}

function primaryArtistItem(
	artists: { id: number; name: string }[] | undefined
): SearchableListItem | null {
	const first = artists?.[0];
	const name = first?.name?.trim();

	if (!first?.id || !name) return null;

	return {
		key: getEntityId('artist', first.id),
		label: name,
		query: name,
		externalId: first.id,
		entityType: 'artist'
	};
}

function commonFields(
	entityType: EntityType,
	externalId: number,
	displayName: string
): Pick<
	EntityInformation,
	'entityType' | 'externalId' | 'displayName' | 'typeLabel' | 'discogsUrl'
> {
	return {
		entityType,
		externalId,
		displayName,
		typeLabel: entityTypeLabel(entityType),
		discogsUrl: getDiscogsWebsiteUrl(entityType, externalId),
	};
}

function getArtistInformation(artist: Artist): EntityInformation {
	return {
		...commonFields(
			'artist',
			artist.id,
			getEntityDisplayName(artist, 'artist')
		),
		profile: artist.profile,
		urls: artist.urls?.map(parseDiscogsExternalUrl).filter(Boolean) as { href: string; display: string }[],
		realname: artist.realname,
		namevariations: artist.namevariations
	};
}

function getLabelInformation(label: Label): EntityInformation {
	return {
		...commonFields(
			'label',
			label.id,
			getEntityDisplayName(label, 'label')
		),
		profile: label.profile,
		urls: label.urls?.map(parseDiscogsExternalUrl).filter(Boolean) as { href: string; display: string }[],
	};
}

function getMasterInformation(master: Master): EntityInformation {
	return {
		...commonFields(
			'master',
			master.id,
			getEntityDisplayName(master, 'master')
		),
		primaryArtist: primaryArtistItem(master.artists),
		year: master.year,
		genres: master.genres,
		styles: master.styles,
		tracklist: master.tracklist?.map((track) => ({
			position: track.position,
			title: track.title,
			duration: track.duration
		}))
	};
}

function getReleaseInformation(release: Release): EntityInformation {
	const released = release.released ?? release.released_formatted;

	return {
		...commonFields(
			'release',
			release.id,
			getEntityDisplayName(release, 'release')
		),
		primaryArtist: primaryArtistItem(release.artists),
		year: release.year,
		released,
		country: release.country,
		format: formatReleaseFormats(release.formats),
		genres: release.genres,
		styles: release.styles,
		notes: release.notes,
		tracklist: release.tracklist?.map((track) => ({
			position: track.position,
			title: track.title,
			duration: track.duration
		}))
	};
}

export function getEntityInformation(
	document: EntityDocument,
	entityType: EntityType
): EntityInformation {
	switch (entityType) {
		case 'artist':
			return getArtistInformation(document as Artist);
		case 'label':
			return getLabelInformation(document as Label);
		case 'master':
			return getMasterInformation(document as Master);
		case 'release':
			return getReleaseInformation(document as Release);
	}
}
