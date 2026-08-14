import {
	type Label,
	type Release,
} from '$lib/discogs/types';

import type { EdgeType, GraphLink, GraphNode, GraphPatch, NodeType } from '../../types';

import { getLinkId, getNodeId } from './compositions';
import { labelNode } from './nodes';

export function buildLabelsFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = getNodeId('release', release.id);
	const nodeType: NodeType = 'label';

	for (const label of release.labels ?? []) {
		const edgeType: EdgeType = 'on_label';
		const targetNode = getNodeId(nodeType, label.id);

		nodes.push(labelNode(label));
		links.push({
			id: getLinkId(releaseNodeId, edgeType, targetNode),
			source: releaseNodeId,
			target: targetNode,
			type: edgeType
		});
	}

	return { nodes, links };
}

export function buildCompaniesFromRelease(release: Release): GraphPatch {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const releaseNodeId = getNodeId('release', release.id);
	const nodeType: NodeType = 'label';

	for (const company of release.companies ?? []) {
		const edgeType: EdgeType = 'company_on';
		const targetNode = getNodeId(nodeType, company.id);

		nodes.push(labelNode(company));
		links.push({
			id: getLinkId(releaseNodeId, edgeType, targetNode),
			source: releaseNodeId,
			target: targetNode,
			type: edgeType,
			label: company.entity_type_name
		});
	}

	return { nodes, links };
}

export function buildFromLabel(label: Label): GraphPatch {
	const nodes: GraphNode[] = [labelNode(label)];
	const links: GraphLink[] = [];
	const nodeType: NodeType = 'label';
	const edgeType: EdgeType = 'sublabel_of';

	for (const sublabel of label.sublabels ?? []) {
		const sourceNode = getNodeId(nodeType, sublabel.id);
		const targetNode = getNodeId(nodeType, label.id);

		nodes.push(labelNode(sublabel));
		links.push({
			id: getLinkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	if (label.parent_label) {
		const sourceNode = getNodeId(nodeType, label.id);
		const targetNode = getNodeId(nodeType, label.parent_label.id);

		nodes.push(labelNode(label.parent_label));
		links.push({
			id: getLinkId(sourceNode, edgeType, targetNode),
			source: sourceNode,
			target: targetNode,
			type: edgeType
		});
	}

	return { nodes, links };
}
