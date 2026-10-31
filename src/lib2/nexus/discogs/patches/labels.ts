import { plugin as source } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type { EntityType, Label, RelationshipType, Release } from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'sublabel_of';
	const parentNodeId = source.compositions.getEntityId(nodeType, label.id);

	for (const sublabel of label.sublabels ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, sublabel.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, sublabel.name, sublabel.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId));
	}

	if (label.parent_label) {
		const nodeId = source.compositions.getEntityId(nodeType, label.parent_label.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, label.parent_label.name, label.parent_label.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType));
	}

	return { nodes, links };
}

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const parentNodeType: EntityType = 'release';
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'on_label';
	const parentNodeId = source.compositions.getEntityId(parentNodeType, release.id);

	for (const label of release.labels ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, label.id);
		const linkId = source.compositions.getRelationshipId(parentNodeId, linkType, nodeId);

		nodes.push(createNode(nodeId, nodeType, label.name, label.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType));
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const parentNodeType: EntityType = 'release';
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'company_on';
	const parentNodeId = source.compositions.getEntityId(parentNodeType, release.id);

	for (const company of release.companies ?? []) {
		const nodeId = source.compositions.getEntityId(nodeType, company.id);
		const linkId = source.compositions.getRelationshipId(nodeId, linkType, parentNodeId);

		nodes.push(createNode(nodeId, nodeType, company.name, company.id));
		links.push(createLink(linkId, parentNodeId, nodeId, linkType, nodeId, parentNodeId, company.entity_type_name?.toLowerCase()));
	}

	return { nodes, links };
}
