import { getReleaseNavigationLabel } from './releases';
import { dedupeById } from '../filters';

import type {
	Artist,
	EntityDocument,
	EntityType,
	Label,
	Master,
	Release,
	RelatedEntityType,
	NavigationPayload
} from '../types';

const RELATED_ENTITY_GROUPS: { id: RelatedEntityType; title: string }[] = [
	{ id: 'aliases', title: 'Aliases' },
	{ id: 'members', title: 'Members' },
	{ id: 'groups', title: 'Groups' },
	{ id: 'parent_label', title: 'Parent label' },
	{ id: 'sublabels', title: 'Sublabels' },
	{ id: 'main_release', title: 'Main release' },
	{ id: 'linked_master', title: 'Master' },
	{ id: 'artists', title: 'Artists' },
	{ id: 'labels', title: 'Labels' },
	{ id: 'credited_artists', title: 'Credited artists' },
	{ id: 'companies', title: 'Companies' }
];

export function getArtistNavigationPayload(artist: Artist, navigationKey?: string, navigationLabel?: string): NavigationPayload {
	return {
		key: navigationKey ?? String(artist.id),
		externalId: artist.id,
		label: navigationLabel ?? artist.name,
		query: artist.name,
		entityType: 'artist'
	};
}

function getLabelNavigationPayload(label: Label, navigationKey?: string, navigationLabel?: string): NavigationPayload {
	return {
		key: navigationKey ?? String(label.id),
		externalId: label.id,
		label: navigationLabel ?? label.name,
		query: label.name,
		entityType: 'label'
	};
}

function getMasterMainReleaseNavigationPayload(master: Master): NavigationPayload {
	const artistName = master.artists?.map(artist => artist.name).join(' / ');

	const navigationLabel = getReleaseNavigationLabel({
		title: master.title,
		artist: artistName,
		year: master.year
	});

	return {
		key: `main-release-${master.main_release}`,
		externalId: master.main_release ?? 0,
		label: navigationLabel,
		query: master.title.trim(),
		entityType: 'release',
		artist: artistName,
		year: master.year
	};
}

function getReleaseLinkedMasterNavigationPayload(release: Release): NavigationPayload {
	const artistName = release.artists?.map(artist => artist.name).join(' / ');

	const navigationLabel = getReleaseNavigationLabel({
		title: release.title,
		artist: artistName,
		year: release.year
	});

	return {
		key: `linked-master-${release.master_id}`,
		externalId: release.master_id ?? 0,
		label: navigationLabel,
		query: release.title.trim(),
		entityType: 'master',
		artist: artistName,
		year: release.year
	};
}
export function getRelatedEntities(
	document: EntityDocument,
	entityType: EntityType,
	relatedEntityType: RelatedEntityType
): NavigationPayload[] {
	switch (entityType) {
		case 'artist': {
			const artist = document as Artist;
			const aliases = artist.aliases ?? [];
			const members = artist.members ?? [];
			const groups = artist.groups ?? [];

			switch (relatedEntityType) {
				case 'aliases':
					return dedupeById(aliases).map((alias) => getArtistNavigationPayload(alias));
				case 'artists':
					return dedupeById(members.concat(groups)).map((artist) => getArtistNavigationPayload(artist));
				case 'members':
					return dedupeById(members).map((member) => {
						const navigationLabel = member.active === false ? `${member.name} (inactive)` : member.name;

						return getArtistNavigationPayload(member, String(member.id), navigationLabel);
					});
				case 'groups':
					return dedupeById(groups).map((group) => getArtistNavigationPayload(group));
				default:
					return [];
			}
		}
		case 'label': {
			const label = document as Label;
			const sublabels = label.sublabels ?? [];
			const parentLabel = label.parent_label;

			switch (relatedEntityType) {
				case 'labels':
					return dedupeById(sublabels.concat(parentLabel ? [parentLabel] : [])).map((label) => getLabelNavigationPayload(label));
				case 'parent_label':
					if (!parentLabel) return [];

					return [getLabelNavigationPayload(parentLabel)];
				case 'sublabels':
					return dedupeById(sublabels).map((sublabel) => getLabelNavigationPayload(sublabel));
				default:
					return [];
			}
		}
		case 'master': {
			const master = document as Master;
			const masterArtists = master.artists ?? [];
			const mainRelease = master.main_release;

			switch (relatedEntityType) {
				case 'artists':
					return dedupeById(masterArtists).map((artist) => getArtistNavigationPayload(artist));
				case 'main_release':
					if (!mainRelease) return [];

					return [getMasterMainReleaseNavigationPayload(master)];
				default:
					return [];
			}
		}
		case 'release': {
			const release = document as Release;
			const releaseArtists = release.artists ?? [];
			const releaseCompanies = release.companies ?? [];
			const releaseCredits = release.credits ?? [];
			const releaseExtraArtists = release.extraartists ?? [];
			const releaseLabels = release.labels ?? [];
			const releaseTrackArtists = release.tracklist?.flatMap((track) => (track.extraartists ?? []))?? [];
			const releaseMaster = release.master_id;

			switch (relatedEntityType) {
				case 'artists':
					return dedupeById(releaseArtists).map((artist) => getArtistNavigationPayload(artist));
				case 'companies':
					return dedupeById(releaseCompanies).map((company, index) => {
						const catno = company.catno == null || company.catno === '' || company.catno === 'none' ? '' : company.catno;

						const navigationKey = `${company.id}-${company.entity_type_name ?? ''}-${index}`;
						const navigationLabel = company.entity_type_name && catno
							? `${company.name} (${catno}) — ${company.entity_type_name}`
							: company.entity_type_name
							? `${company.name} — ${company.entity_type_name}`
							: company.catno
							? `${company.name} (${catno})`
							: company.name;

						return getLabelNavigationPayload(company, navigationKey, navigationLabel);
					});
				case 'credited_artists':
					return dedupeById([...releaseExtraArtists, ...releaseCredits, ...releaseTrackArtists]).map((artist, index) => {
						const navigationKey = `${artist.id}-${artist.role ?? ''}-${index}`;
						const navigationLabel = artist.role ? `${artist.name} — ${artist.role}` : artist.name;

						return getArtistNavigationPayload(artist, navigationKey, navigationLabel);
					});
				case 'labels':
					return dedupeById(releaseLabels).map((label) => {
						const catno = label.catno == null || label.catno === '' || label.catno === 'none' ? '' : label.catno;

						const navigationKey = `${label.id}${catno ? `-${catno}` : ''}`;
						const navigationLabel = catno ? `${label.name} (${catno})` : label.name;

						return getLabelNavigationPayload(label, navigationKey, navigationLabel);
					});
				case 'linked_master':
					if (!releaseMaster) return [];
					return [getReleaseLinkedMasterNavigationPayload(release)];
				default:
					return [];
			}
		}
		default:
			return [];
	}
}

function hasRelatedEntities(
	document: EntityDocument,
	entityType: EntityType,
	relatedEntityType: RelatedEntityType
): boolean {
	const isMasterOrRelease = entityType === 'master' || entityType === 'release';

	switch (relatedEntityType) {
		case 'artists':
			return isMasterOrRelease && (getRelatedEntities(document, entityType, 'artists')?.length ?? 0) > 0;
		case 'labels':
			return isMasterOrRelease && (getRelatedEntities(document, entityType, 'labels')?.length ?? 0) > 0;
		default:
			return (getRelatedEntities(document, entityType, relatedEntityType)?.length ?? 0) > 0;;
	}
}

export function getRelatedEntityGroups(
	document: EntityDocument,
	entityType: EntityType
): { id: RelatedEntityType; title: string }[] {
	return RELATED_ENTITY_GROUPS.filter((group) => hasRelatedEntities(document, entityType, group.id));
}
