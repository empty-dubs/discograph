import { plugin as source } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type { EntityType, Label, RelationshipType, Release } from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'sublabel_of';
	const sourceNodeId = source.compositions.getEntityId(nodeType, label.id);

	for (const sublabel of label.sublabels ?? []) {
		const targetNodeId = source.compositions.getEntityId(nodeType, sublabel.id);
		const linkId = source.compositions.getRelationshipId(targetNodeId, linkType, sourceNodeId);

		nodes.push(createNode(targetNodeId, nodeType, sublabel.name, sublabel.id));
		links.push(createLink(linkId, targetNodeId, sourceNodeId, linkType));
	}

	if (label.parent_label) {
		const targetNodeId = source.compositions.getEntityId(nodeType, label.parent_label.id);
		const linkId = source.compositions.getRelationshipId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, label.parent_label.name, label.parent_label.id));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const sourceNodeType: EntityType = 'release';
	const targetNodeType: EntityType = 'label';
	const linkType: RelationshipType = 'on_label';
	const sourceNodeId = source.compositions.getEntityId(sourceNodeType, release.id);

	for (const label of release.labels ?? []) {
		const targetNodeId = source.compositions.getEntityId(targetNodeType, label.id);
		const linkId = source.compositions.getRelationshipId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, targetNodeType, label.name, label.id));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const sourceNodeType: EntityType = 'release';
	const targetNodeType: EntityType = 'label';
	const linkType: RelationshipType = 'company_on';
	const sourceNodeId = source.compositions.getEntityId(sourceNodeType, release.id);

	for (const company of release.companies ?? []) {
		const targetNodeId = source.compositions.getEntityId(targetNodeType, company.id);
		const linkId = source.compositions.getRelationshipId(targetNodeId, linkType, sourceNodeId);

		nodes.push(createNode(targetNodeId, targetNodeType, company.name, company.id));
		links.push(createLink(linkId, targetNodeId, sourceNodeId, linkType, company.entity_type_name?.toLowerCase()));
	}

	return { nodes, links };
}
