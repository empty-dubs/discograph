import { getReleaseItemLabel } from './releases';
import { getEntityId } from './compositions';
import { dedupeById } from './transformations';

import type {
	Artist,
	EntityType,
	Label,
	Master,
	NodePayload,
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
	{ id: 'credited_artists', title: 'Credited artists' },
	{ id: 'companies', title: 'Companies' }
];

export function getRelatedEntities(
	document: unknown,
	entityType: EntityType,
	relatedEntityType: RelatedEntityType
): Array<NodePayload> {
	switch (entityType) {
		case 'artist':
			const artist = document as Artist;
			const aliases = artist.aliases ?? [];
			const members = artist.members ?? [];
			const groups = artist.groups ?? [];
			switch (relatedEntityType) {
				case 'aliases':
					return dedupeById(aliases);
				case 'artists':
					return dedupeById(members.concat(groups));
				case 'groups':
					return dedupeById(groups);
				case 'members':
					return dedupeById(members);
				default:
					return [];
			}
		case 'label':
			const label = document as Label;
			const sublabels = label.sublabels ?? [];
			const parentLabel = label.parent_label;
			switch (relatedEntityType) {
				case 'labels':
					return dedupeById(sublabels.concat(parentLabel ? [parentLabel] : []));
				case 'parent_label':
					return parentLabel ? [parentLabel] : [];
				case 'sublabels':
					return dedupeById(sublabels);
				default:
					return [];
			}
		case 'master':
			const master = document as Master;
			const masterArtists = master.artists ?? [];
			const mainRelease = master.main_release;
			switch (relatedEntityType) {
				case 'artists':
					return dedupeById(masterArtists);
				case 'main_release':
					return mainRelease ? [{ id: mainRelease }] : [];
				default:
					return [];
			}
		case 'release':
			const release = document as Release;
			const releaseArtists = release.artists ?? [];
			const linkedMaster = release.master_id;
			const labels = release.labels ?? [];
			const companies = release.companies ?? [];
			const credits = release.credits ?? [];
			const extraArtists = release.extraartists ?? [];
			const trackArtists = release.tracklist?.flatMap((track) => (track.extraartists ?? []))?? [];
			switch (relatedEntityType) {
				case 'artists':
					return dedupeById(releaseArtists);
				case 'labels':
					return dedupeById(labels);
				case 'credited_artists':
					return dedupeById([...extraArtists, ...credits, ...trackArtists]);
				case 'companies':
					return dedupeById(companies);
				case 'linked_master':
					return linkedMaster ? [{ id: linkedMaster }] : [];
				default:
					return [];
			}
		default:
			return [];
	}
}

function hasRelatedEntityMap(
	document: unknown,
	entityType: EntityType
): Record<RelatedEntityType, boolean> {
	const isMasterOrRelease = entityType === 'master' || entityType === 'release';

	return {
		aliases: (getRelatedEntities(document, entityType, 'aliases')?.length ?? 0) > 0,
		members: (getRelatedEntities(document, entityType, 'members')?.length ?? 0) > 0,
		groups: (getRelatedEntities(document, entityType, 'groups')?.length ?? 0) > 0,
		parent_label: (getRelatedEntities(document, entityType, 'parent_label')?.length ?? 0) > 0,
		sublabels: (getRelatedEntities(document, entityType, 'sublabels')?.length ?? 0) > 0,
		main_release: (getRelatedEntities(document, entityType, 'main_release')?.length ?? 0) > 0,
		linked_master: (getRelatedEntities(document, entityType, 'linked_master')?.length ?? 0) > 0,
		artists: isMasterOrRelease && (getRelatedEntities(document, entityType, 'artists')?.length ?? 0) > 0,
		labels: isMasterOrRelease && (getRelatedEntities(document, entityType, 'labels')?.length ?? 0) > 0,
		credited_artists: (getRelatedEntities(document, entityType, 'credited_artists')?.length ?? 0) > 0,
		companies: (getRelatedEntities(document, entityType, 'companies')?.length ?? 0) > 0
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

			if (relatedEntityType === 'credited_artists') {
				const credits = [];
				const trackArtists = release.tracklist?.flatMap((track, index) => 
					(track.extraartists ?? []).map((artist) => ({
						...artist,
						role: `Track ${index + 1}`
					}))
				) ?? [];

				credits.push(
					...(release.extraartists ?? []),
					...(release.credits ?? []),
					...trackArtists
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
