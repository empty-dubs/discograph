import { getLinkId, getNodeId } from './compositions';
import { createLabelNode } from './nodes';

import type { Label, Release } from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '$lib/graph/types';

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'label';
	const edgeType: EdgeType = 'on_label';
	const sourceNodeId = release.id;

	for (const label of release.labels ?? []) {
		const targetNodeId = getNodeId(nodeType, label.id);

		nodes.push(createLabelNode(label));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'label';
	const edgeType: EdgeType = 'company_on';
	const sourceNodeId = release.id;

	for (const company of release.companies ?? []) {
		const targetNodeId = getNodeId(nodeType, company.id);

		nodes.push(createLabelNode(company));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType,
			label: company.entity_type_name
		});
	}

	return { nodes, links };
}

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'label';
	const edgeType: EdgeType = 'sublabel_of';
	const sourceNodeId = label.id;

	for (const sublabel of label.sublabels ?? []) {
		const targetNodeId = getNodeId(nodeType, sublabel.id);

		nodes.push(createLabelNode(sublabel));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	if (label.parent_label) {
		const targetNodeId = getNodeId(nodeType, label.parent_label.id);

		nodes.push(createLabelNode(label.parent_label));

		links.push({
			id: getLinkId(sourceNodeId, edgeType, targetNodeId),
			source: sourceNodeId,
			target: targetNodeId,
			type: edgeType
		});
	}

	return { nodes, links };
}
