import { discogsPlugin as discogs } from '../../../plugins/discogs';

import { createLink, createNode } from '../../../graph/factory';

import type { EntityType, Label, RelationshipType, Release } from '../../../plugins/discogs';
import type { GraphLink, GraphNode, GraphPatch } from '../../../graph/types';

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'sublabel_of';
	const sourceNodeId = String(label.id);

	for (const sublabel of label.sublabels ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, sublabel.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, sublabel.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	if (label.parent_label) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, label.parent_label.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, label.parent_label.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'on_label';
	const sourceNodeId = String(release.id);

	for (const label of release.labels ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, label.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, label.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType));
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: EntityType = 'label';
	const linkType: RelationshipType = 'company_on';
	const sourceNodeId = String(release.id);

	for (const company of release.companies ?? []) {
		const targetNodeId = discogs.compositions.nodeId(nodeType, company.id);
		const linkId = discogs.compositions.linkId(sourceNodeId, linkType, targetNodeId);

		nodes.push(createNode(targetNodeId, nodeType, company.name));
		links.push(createLink(linkId, sourceNodeId, targetNodeId, linkType, company.entity_type_name?.toLowerCase()));
	}

	return { nodes, links };
}
