import { getReleaseItemLabel } from './releases';
import { dedupeById } from './transformations';

import type {
	Artist,
	EntityType,
	Label,
	Master,
	Release,
	RelatedEntityType,
	SearchableListItem
} from './types';

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
	{ id: 'credits', title: 'Credits' },
	{ id: 'companies', title: 'Companies' }
];

function releaseCreditsLength(release: Release): number {
	return (release.extraartists ?? release.credits)?.length ?? 0;
}

function getRelatedEntityCount(
	document: unknown,
	relatedEntityType: RelatedEntityType
): number | undefined {
	switch (relatedEntityType) {
		case 'aliases':
			return (document as Artist).aliases?.length;
		case 'members':
			return (document as Artist).members?.length;
		case 'groups':
			return (document as Artist).groups?.length;
		case 'sublabels':
			return (document as Label).sublabels?.length;
		case 'artists':
			return (document as Master | Release).artists?.length;
		case 'labels':
			return (document as Release).labels?.length;
		case 'credits':
			return releaseCreditsLength(document as Release) || undefined;
		case 'companies':
			return (document as Release).companies?.length;
		default:
			return undefined;
	}
}

function hasRelatedEntityMap(
	document: unknown,
	entityType: EntityType
): Record<RelatedEntityType, boolean> {
	const isMasterOrRelease = entityType === 'master' || entityType === 'release';
	const release = document as Release;

	return {
		aliases: entityType === 'artist' && (getRelatedEntityCount(document, 'aliases') ?? 0) > 0,
		members: entityType === 'artist' && (getRelatedEntityCount(document, 'members') ?? 0) > 0,
		groups: entityType === 'artist' && (getRelatedEntityCount(document, 'groups') ?? 0) > 0,
		parent_label: entityType === 'label' && Boolean((document as Label).parent_label),
		sublabels: entityType === 'label' && (getRelatedEntityCount(document, 'sublabels') ?? 0) > 0,
		main_release: entityType === 'master' && Boolean((document as Master).main_release),
		linked_master: entityType === 'release' && Boolean(release.master_id),
		artists: isMasterOrRelease && (getRelatedEntityCount(document, 'artists') ?? 0) > 0,
		labels: entityType === 'release' && (getRelatedEntityCount(document, 'labels') ?? 0) > 0,
		credits: entityType === 'release' && (getRelatedEntityCount(document, 'credits') ?? 0) > 0,
		companies: entityType === 'release' && (getRelatedEntityCount(document, 'companies') ?? 0) > 0
	};
}

export function getRelatedEntityGroups(
	document: unknown,
	entityType: EntityType
): { id: RelatedEntityType; title: string }[] {
	const isVisible = hasRelatedEntityMap(document, entityType);

	return RELATED_ENTITY_GROUPS.filter((group) => isVisible[group.id]);
}

export function getRelatedEntityItems(
	document: unknown,
	entityType: EntityType,
	relatedEntityType: RelatedEntityType
): SearchableListItem[] {
	switch (entityType) {
		case 'artist': {
			const artist = document as Artist;

			switch (relatedEntityType) {
				case 'aliases':
					return (artist.aliases ?? []).map((alias) => ({
						key: String(alias.id),
						label: alias.name,
						query: alias.name,
						externalId: alias.id,
						entityType: 'artist'
					}));
				case 'members':
					return (artist.members ?? []).map((member) => ({
						key: String(member.id),
						label: member.active === false ? `${member.name} (inactive)` : member.name,
						query: member.name,
						externalId: member.id,
						entityType: 'artist'
					}));
				case 'groups':
					return (artist.groups ?? []).map((group) => ({
						key: String(group.id),
						label: group.name,
						query: group.name,
						externalId: group.id,
						entityType: 'artist'
					}));
				default:
					return [];
			}
		}
		case 'label': {
			const label = document as Label;

			if (relatedEntityType === 'parent_label' && label.parent_label) {
				return [
					{
						key: String(label.parent_label.id),
						label: label.parent_label.name,
						query: label.parent_label.name,
						externalId: label.parent_label.id,
						entityType: 'label'
					}
				];
			}

			if (relatedEntityType === 'sublabels') {
				return (label.sublabels ?? []).map((sublabel) => ({
					key: String(sublabel.id),
					label: sublabel.name,
					query: sublabel.name,
					externalId: sublabel.id,
					entityType: 'label'
				}));
			}

			return [];
		}
		case 'master': {
			const master = document as Master;

			if (relatedEntityType === 'main_release' && master.main_release) {
				const artistName = master.artists?.map(artist => artist.name).join(' / ');
				const label = getReleaseItemLabel({
					title: master.title,
					artist: artistName,
					year: master.year
				});

				return [
					{
						key: `main-release-${master.main_release}`,
						label,
						query: master.title.trim(),
						externalId: master.main_release,
						entityType: 'release',
						artist: artistName,
						year: master.year
					}
				];
			}

			if (relatedEntityType === 'artists') {
				return (master.artists ?? []).map((artist) => ({
					key: String(artist.id),
					label: artist.name,
					query: artist.name,
					externalId: artist.id,
					entityType: 'artist'
				}));
			}

			return [];
		}
		case 'release': {
			const release = document as Release;

			if (relatedEntityType === 'linked_master' && release.master_id) {
				const artistName = release.artists?.map(artist => artist.name).join(' / ');

				const label = getReleaseItemLabel({
					title: release.title,
					artist: artistName,
					year: release.year
				});

				return [
					{
						key: `linked-master-${release.master_id}`,
						label,
						query: release.title.trim(),
						externalId: release.master_id,
						entityType: 'master',
						artist: artistName,
						year: release.year
					}
				];
			}

			if (relatedEntityType === 'artists') {
				return (release.artists ?? []).map((artist) => ({
					key: String(artist.id),
					label: artist.name,
					query: artist.name,
					externalId: artist.id,
					entityType: 'artist'
				}));
			}

			if (relatedEntityType === 'labels') {
				return (release.labels ?? []).map((labelRef) => {
					const catno = labelRef.catno == null || labelRef.catno === '' || labelRef.catno === 'none' ? '' : labelRef.catno;

					return {
					key: `${labelRef.id}${catno ? `-${catno}` : ''}`,
					label: catno ? `${labelRef.name} (${catno})` : labelRef.name,
						query: labelRef.name,
						externalId: labelRef.id,
						entityType: 'label'
					};
				});
			}

			if (relatedEntityType === 'credits') {
				const credits = [];
				const trackArtists = release.tracklist?.flatMap((track) =>
					(track.extraartists ?? []).map((artist) => ({
						...artist,
						role: `Track appearance`
					}))
				) ?? [];

				credits.push(
					...dedupeById([
						...(release.extraartists ?? []),
						...(release.credits ?? []),
						...trackArtists
					])
				);

				return credits.map((credit, index) => ({
					key: `${credit.id}-${credit.role ?? ''}-${index}`,
					label: credit.role ? `${credit.name} — ${credit.role}` : credit.name,
					query: credit.name,
					externalId: credit.id,
					entityType: 'artist'
				}));
			}

			if (relatedEntityType === 'companies') {
				return (release.companies ?? []).map((company, index) => {
					const catno = company.catno == null || company.catno === '' || company.catno === 'none' ? '' : company.catno;

					return {
						key: `${company.id}-${company.entity_type_name ?? ''}-${index}`,
						label: company.entity_type_name && catno
							? `${company.name} (${catno}) — ${company.entity_type_name}`
							: company.entity_type_name
								? `${company.name} — ${company.entity_type_name}`
								: company.catno
									? `${company.name} (${catno})`
									: company.name,
						query: company.name,
						externalId: company.id,
						entityType: 'label'
					};
				});
			}

			return [];
		}
		default:
			return [];
	}
}
