export class ExpansionState {
	expansionChildren = $state<Map<string, Set<string>>>(new Map());
	expanded = $state<Set<string>>(new Set());


	clear() {
		this.expansionChildren = new Map();
		this.expanded = new Set();
	}
}

export const expansionState = new ExpansionState();
