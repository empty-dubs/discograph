import { releaseRowDisplay } from './releases';

import type { SearchableListItem } from '../../../../shared/types';
import type { Artist, EntityType, Label, Master, RelatedEntityType, Release } from '../../../../../plugins/discogs';

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

export function getRelatedEntityCount(
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
			return (document as Release).credits?.length;
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

	return {
		aliases: entityType === 'artist' && ((document as Artist).aliases?.length ?? 0) > 0,
		members: entityType === 'artist' && ((document as Artist).members?.length ?? 0) > 0,
		groups: entityType === 'artist' && ((document as Artist).groups?.length ?? 0) > 0,
		parent_label: entityType === 'label' && Boolean((document as Label).parent_label),
		sublabels: entityType === 'label' && ((document as Label).sublabels?.length ?? 0) > 0,
		main_release: entityType === 'master' && Boolean((document as Master).main_release),
		linked_master: entityType === 'release' && Boolean((document as Release).master_id),
		artists: isMasterOrRelease && ((document as Master | Release).artists?.length ?? 0) > 0,
		labels: entityType === 'release' && ((document as Release).labels?.length ?? 0) > 0,
		credits: entityType === 'release' && ((document as Release).credits?.length ?? 0) > 0,
		companies: entityType === 'release' && ((document as Release).companies?.length ?? 0) > 0
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
						discogsId: alias.id,
						searchType: 'artist'
					}));
				case 'members':
					return (artist.members ?? []).map((member) => ({
						key: String(member.id),
						label: member.active === false ? `${member.name} (inactive)` : member.name,
						query: member.name,
						discogsId: member.id,
						searchType: 'artist'
					}));
				case 'groups':
					return (artist.groups ?? []).map((group) => ({
						key: String(group.id),
						label: group.name,
						query: group.name,
						discogsId: group.id,
						searchType: 'artist'
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
						discogsId: label.parent_label.id,
						searchType: 'label'
					}
				];
			}

			if (relatedEntityType === 'sublabels') {
				return (label.sublabels ?? []).map((sublabel) => ({
					key: String(sublabel.id),
					label: sublabel.name,
					query: sublabel.name,
					discogsId: sublabel.id,
					searchType: 'label'
				}));
			}

			return [];
		}
		case 'master': {
			const master = document as Master;

			if (relatedEntityType === 'main_release' && master.main_release) {
				const artistName = master.artists?.[0]?.name;
				const { label, query } = releaseRowDisplay({
					title: master.title,
					artist: artistName,
					year: master.year
				});

				return [
					{
						key: `main-release-${master.main_release}`,
						label,
						query,
						discogsId: master.main_release,
						searchType: 'release',
						artists: master.artists?.map((artist) => ({ id: artist.id, name: artist.name })),
						meta: { year: master.year, genres: master.genres, styles: master.styles }
					}
				];
			}

			if (relatedEntityType === 'artists') {
				return (master.artists ?? []).map((artist) => ({
					key: String(artist.id),
					label: artist.name,
					query: artist.name,
					discogsId: artist.id,
					searchType: 'artist'
				}));
			}

			return [];
		}
		case 'release': {
			const release = document as Release;
			const artists = release.artists?.map((artist) => ({ id: artist.id, name: artist.name }));
			const meta = {
				year: release.year,
				genres: release.genres,
				styles: release.styles
			};

			if (relatedEntityType === 'linked_master' && release.master_id) {
				const { label, query } = releaseRowDisplay({
					title: release.title,
					artist: artists?.[0]?.name,
					year: release.year
				});

				return [
					{
						key: `linked-master-${release.master_id}`,
						label,
						query,
						discogsId: release.master_id,
						searchType: 'master',
						artists,
						meta
					}
				];
			}

			if (relatedEntityType === 'artists') {
				return (release.artists ?? []).map((artist) => ({
					key: String(artist.id),
					label: artist.name,
					query: artist.name,
					discogsId: artist.id,
					searchType: 'artist'
				}));
			}

			if (relatedEntityType === 'labels') {
				return (release.labels ?? []).map((labelRef) => ({
					key: `${labelRef.id}-${labelRef.catno ?? ''}`,
					label: labelRef.catno ? `${labelRef.name} (${labelRef.catno})` : labelRef.name,
					query: labelRef.name,
					discogsId: labelRef.id,
					searchType: 'label'
				}));
			}

			if (relatedEntityType === 'credits') {
				const credits = release.extraartists ?? release.credits ?? [];

				return credits.map((credit, index) => ({
					key: `${credit.id}-${credit.role ?? ''}-${index}`,
					label: credit.role ? `${credit.name} — ${credit.role}` : credit.name,
					query: credit.name,
					discogsId: credit.id,
					searchType: 'artist'
				}));
			}

			if (relatedEntityType === 'companies') {
				return (release.companies ?? []).map((company, index) => ({
					key: `${company.id}-${company.entity_type_name ?? ''}-${index}`,
					label: company.entity_type_name && company.catno
						? `${company.name} — ${company.entity_type_name} (${company.catno})`
						: company.entity_type_name
							? `${company.name} — ${company.entity_type_name}`
							: company.catno
								? `${company.name} (${company.catno})`
								: company.name,
					query: company.name,
					discogsId: company.id,
					searchType: 'label'
				}));
			}

			return [];
		}
		default:
			return [];
	}
}
