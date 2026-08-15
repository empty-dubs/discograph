import {
	hasExpansionChildren
} from '../operations/crawlers';
import { graphDataState } from './GraphDataState.svelte';

export class ExpansionState {
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	expanded = $state<Set<string>>(new Set());

	hasChildren(nodeId: string): boolean {
		return hasExpansionChildren(nodeId, this.expansionChildren, graphDataState.nodes);
	}

	clear() {
		this.expansionChildren = new Map();
		this.expanded = new Set();
	}
}

export const expansionState = new ExpansionState();
