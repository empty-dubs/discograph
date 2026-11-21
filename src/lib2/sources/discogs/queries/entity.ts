import { getDiscogsWebsiteUrl, getEntityDisplayName, getEntityId } from '../compositions';
import { presentation } from '../presentation';
import { getArtistNavigationPayload } from './related-entities';
import { normalizeExternalUrl } from '../transformations';

import type {
	Artist,
	EntityDocument,
	EntityInformation,
	EntityType,
	ExternalUrl,
	Label,
	Master,
	Release,
    ReleaseFormat
} from '../types';

function getEntityTypeLabel(entityType: EntityType): string {
	return presentation.entities[entityType]?.label ?? entityType;
}

function getReleaseFormats(formats?: ReleaseFormat[]): string | undefined {
	if (!formats?.length) return;

	return formats
		.map((format) => {
			// join non-empty format descriptions, separated by comma
			// the Boolean filter is used to remove undefined and null values
			const descriptions = format.descriptions?.filter(Boolean).join(', ');

			return descriptions ? `${format.name} (${descriptions})` : format.name;
		})
		.join(', ');
}

function getCommonFields(
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
		typeLabel: getEntityTypeLabel(entityType),
		discogsUrl: getDiscogsWebsiteUrl(entityType, externalId),
	};
}

function getArtistInformation(artist: Artist): EntityInformation {
	return {
		...getCommonFields(
			'artist',
			artist.id,
			getEntityDisplayName(artist, 'artist')
		),
		profile: artist.profile,
		urls: artist.urls?.map(normalizeExternalUrl).filter(Boolean) as ExternalUrl[],
		realname: artist.realname,
		namevariations: artist.namevariations
	};
}

function getLabelInformation(label: Label): EntityInformation {
	return {
		...getCommonFields(
			'label',
			label.id,
			getEntityDisplayName(label, 'label')
		),
		profile: label.profile,
		urls: label.urls?.map(normalizeExternalUrl).filter(Boolean) as ExternalUrl[],
	};
}

function getMasterInformation(master: Master): EntityInformation {
	const primaryArtist = master.artists?.[0] as Artist;

	const navigationKey = getEntityId('artist', primaryArtist.id);

	return {
		...getCommonFields(
			'master',
			master.id,
			getEntityDisplayName(master, 'master')
		),
		primaryArtist: getArtistNavigationPayload(primaryArtist, navigationKey),
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
	const primaryArtist = release.artists?.[0] as Artist;

	const navigationKey = getEntityId('artist', primaryArtist.id);

	return {
		...getCommonFields(
			'release',
			release.id,
			getEntityDisplayName(release, 'release')
		),
		primaryArtist: getArtistNavigationPayload(primaryArtist, navigationKey),
		year: release.year,
		released,
		country: release.country,
		format: getReleaseFormats(release.formats),
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
