import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	select,
	zoom,
	zoomIdentity,
	type ForceLink,
	type Simulation,
	type SimulationLinkDatum,
	type ZoomBehavior,
	type ZoomTransform,
} from 'd3';

import { NODE_COLORS, NODE_RADIUS } from './constants';

import type { EdgeType, GraphLink, GraphNode } from './types';

interface SimulationNode extends GraphNode {
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

interface SimulationLink extends SimulationLinkDatum<SimulationNode> {
	id: string;
	type: string;
	label?: string;
}

interface ForceGraphTooltip {
	x: number;
	y: number;
	text: string;
}

interface ForceGraphOptions {
	onNodeClick: (nodeId: string) => void;
	onNodeContextMenu?: (nodeId: string, event: MouseEvent) => void;
	onTooltip: (tooltip: ForceGraphTooltip | null) => void;
}

function formatEdgeTooltip(link: SimulationLink): string {
	const type = link.type.replace(/_/g, ' ');

	return link.label ? `${type} (${link.label})` : type;
}

function formatNodeTooltip(node: SimulationNode): string {
	const meta = [node.type, node.meta?.year ? String(node.meta.year) : null, node.meta?.role ?? null]
		.filter(Boolean)
		.join(' · ');

	return `${node.displayName}${meta ? ` (${meta})` : ''}`;
}

function truncateLabel(name: string): string {
	return name.length > 24 ? `${name.slice(0, 22)}…` : name;
}

function distanceToSegment(
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const lengthSq = dx * dx + dy * dy;

	if (lengthSq === 0) {
		const ddx = px - x1;
		const ddy = py - y1;
		return Math.sqrt(ddx * ddx + ddy * ddy);
	}

	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
	const projX = x1 + t * dx;
	const projY = y1 + t * dy;
	const ddx = px - projX;
	const ddy = py - projY;

	return Math.sqrt(ddx * ddx + ddy * ddy);
}

export class ForceGraphNoSvg {
	private canvas: HTMLCanvasElement;
	private options: ForceGraphOptions;
	private width = 800;
	private height = 600;
	private dpr = 1;                     // device pixel ratio

	private ctx: CanvasRenderingContext2D | null = null;
	private canvasSelection: ReturnType<typeof select<HTMLCanvasElement, unknown>> | null = null;
	private simulation: Simulation<SimulationNode, SimulationLink> | null = null;
	private simulationNodes: SimulationNode[] = [];
	private simulationLinks: SimulationLink[] = [];
	private zoomTransform: ZoomTransform = zoomIdentity;
	private tooltipText: string | null = null;
	private showNodeLabels = true;
	private selectedId: string | null = null;
	private highlightedEdgeType: EdgeType | null = null;
	private draggedNode: SimulationNode | null = null;
	private wasDragged = false;
	private dragStartX = 0;
	private dragStartY = 0;

	private zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> = zoom<HTMLCanvasElement, unknown>()
		.filter((event) => {
			if (event.type === 'wheel') return true;
			if (this.draggedNode) return false;

			const sourceEvent = event.sourceEvent as MouseEvent | PointerEvent | null;

			if (!sourceEvent || !('clientX' in sourceEvent)) return true;
			if (sourceEvent.button !== 0) return true;

			const mousePosition = this.getMousePosition(sourceEvent.clientX, sourceEvent.clientY);

			return !this.selectClosestNode(mousePosition.x, mousePosition.y);
		})
		.on('zoom', (event) => {
			this.zoomTransform = event.transform;
			this.render();
		});

	constructor(canvas: HTMLCanvasElement, options: ForceGraphOptions) {
		this.canvas = canvas;
		this.options = options;
		this.setup();
	}

	private resizeCanvas() {
		if (!this.canvas || !this.ctx) return;

		this.dpr = window.devicePixelRatio || 1;

		this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
		this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));

		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
	}

	private getMousePosition(mouseX: number, mouseY: number): { x: number; y: number } {
		if (!this.canvas) return { x: 0, y: 0 };

		const rect = this.canvas.getBoundingClientRect();

		const px = mouseX - rect.left;
		const py = mouseY - rect.top;

		return {
			x: (px - this.zoomTransform.x) / this.zoomTransform.k,
			y: (py - this.zoomTransform.y) / this.zoomTransform.k
		};
	}

	private selectClosestNode(x: number, y: number): SimulationNode | null {
		let mousePosition = this.getMousePosition(x, y);
		let closestNode: SimulationNode | null = null;
		let closestNodeDistance = Infinity;

		for (const node of this.simulationNodes) {
			const radius = NODE_RADIUS[node.type];
			const dx = mousePosition.x - (node.x ?? 0);
			const dy = mousePosition.y - (node.y ?? 0);

			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist <= radius && dist < closestNodeDistance) {
				closestNode = node;
				closestNodeDistance = dist;
			}
		}

		return closestNode;
	}

	private selectClosestLink(x: number, y: number): SimulationLink | null {
		let mousePosition = this.getMousePosition(x, y);
		const threshold = 5 / this.zoomTransform.k;

		let closestLink: SimulationLink | null = null;
		let closestLinkDistance = Infinity;

		for (const link of this.simulationLinks) {
			const source = link.source as SimulationNode;
			const target = link.target as SimulationNode;
			const dist = distanceToSegment(
				mousePosition.x,
				mousePosition.y,
				source.x ?? 0,
				source.y ?? 0,
				target.x ?? 0,
				target.y ?? 0
			);

			if (dist <= threshold && dist < closestLinkDistance) {
				closestLink = link;
				closestLinkDistance = dist;
			}
		}

		return closestLink;
	}

	private getLinkStyle(link: SimulationLink): { stroke: string; opacity: number; width: number } {
		const highlightedType = this.highlightedEdgeType;

		if (!highlightedType) {
			return { stroke: '#999', opacity: 0.6, width: 1.5 };
		}

		if (link.type === highlightedType) {
			return { stroke: '#ffffff', opacity: 1, width: 1.5 };
		}

		return { stroke: '#555555', opacity: 0.15, width: 1 };
	}

	private updateTooltip(clientX: number, clientY: number) {
		const node = this.selectClosestNode(clientX, clientY);

		if (node) {
			this.tooltipText = formatNodeTooltip(node);
			this.options.onTooltip({
				x: clientX,
				y: clientY,
				text: this.tooltipText
			});
			return;
		}

		const link = this.selectClosestLink(clientX, clientY);

		if (link) {
			this.tooltipText = formatEdgeTooltip(link);
			this.options.onTooltip({
				x: clientX,
				y: clientY,
				text: this.tooltipText
			});
			return;
		}

		this.tooltipText = null;
		this.options.onTooltip(null);
	}

	private boundPointerDown = (event: PointerEvent) => this.onPointerDown(event);
	private boundPointerMove = (event: PointerEvent) => this.onPointerMove(event);
	private boundPointerUp = (event: PointerEvent) => this.onPointerUp(event);
	private boundClick = (event: MouseEvent) => this.onClick(event);
	private boundContextMenu = (event: MouseEvent) => this.onContextMenu(event);

	private onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;

		const node = this.selectClosestNode(event.clientX, event.clientY);

		if (!node) return;

		this.draggedNode = node;
		this.wasDragged = false;
		this.dragStartX = event.clientX;
		this.dragStartY = event.clientY;
		node.fx = node.x;
		node.fy = node.y;
		this.simulation?.alphaTarget(0.5).restart();
		this.canvas?.setPointerCapture(event.pointerId);

		if (this.canvas) this.canvas.style.cursor = 'grabbing';
	}

	private onPointerMove(event: PointerEvent) {
		if (this.draggedNode) {
			const moved =
				Math.abs(event.clientX - this.dragStartX) > 2 ||
				Math.abs(event.clientY - this.dragStartY) > 2;

			if (moved) this.wasDragged = true;

			const mousePosition = this.getMousePosition(event.clientX, event.clientY);

			this.draggedNode.fx = mousePosition.x;
			this.draggedNode.fy = mousePosition.y;

			return;
		}

		this.updateTooltip(event.clientX, event.clientY);
	}

	private onPointerUp(event: PointerEvent) {
		if (!this.draggedNode) return;

		this.draggedNode.fx = null;
		this.draggedNode.fy = null;
		this.draggedNode = null;
		this.simulation?.alphaTarget(0);

		if (this.canvas?.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}

		if (this.canvas) this.canvas.style.cursor = 'grab';
	}

	private onClick(event: MouseEvent) {
		if (this.wasDragged) {
			this.wasDragged = false;
			return;
		}

		const node = this.selectClosestNode(event.clientX, event.clientY);

		if (node) this.options.onNodeClick(node.id);
	}

	private onContextMenu(event: MouseEvent) {
		const node = this.selectClosestNode(event.clientX, event.clientY);

		if (!node) return;

		event.preventDefault();
		this.options.onNodeContextMenu?.(node.id, event);
	}

	private render() {
		if (!this.ctx) return;

		const ctx = this.ctx;

		ctx.save();
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.translate(this.zoomTransform.x, this.zoomTransform.y);
		ctx.scale(this.zoomTransform.k, this.zoomTransform.k);

		for (const link of this.simulationLinks) {
			const source = link.source as SimulationNode;
			const target = link.target as SimulationNode;
			const style = this.getLinkStyle(link);

			ctx.beginPath();
			ctx.moveTo(source.x ?? 0, source.y ?? 0);
			ctx.lineTo(target.x ?? 0, target.y ?? 0);
			ctx.strokeStyle = style.stroke;
			ctx.globalAlpha = style.opacity;
			ctx.lineWidth = style.width;
			ctx.stroke();
		}

		ctx.globalAlpha = 1;

		for (const node of this.simulationNodes) {
			const x = node.x ?? 0;
			const y = node.y ?? 0;
			const radius = NODE_RADIUS[node.type];

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = NODE_COLORS[node.type];
			ctx.fill();

			if (node.id === this.selectedId) {
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		}

		if (this.showNodeLabels) {
			ctx.fillStyle = '#ddd';
			ctx.font = '10px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			for (const node of this.simulationNodes) {
				ctx.fillText(truncateLabel(node.displayName), node.x ?? 0, (node.y ?? 0) + 2);
			}
		}

		ctx.restore();
	}

	private setup() {
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;

		this.ctx = this.canvas.getContext('2d');

		this.resizeCanvas();

		this.canvasSelection = select(this.canvas);
		this.canvasSelection.call(this.zoomBehavior);

		this.canvas.addEventListener('pointerdown', this.boundPointerDown);
		this.canvas.addEventListener('pointermove', this.boundPointerMove);
		this.canvas.addEventListener('pointerup', this.boundPointerUp);
		this.canvas.addEventListener('pointercancel', this.boundPointerUp);
		this.canvas.addEventListener('click', this.boundClick);
		this.canvas.addEventListener('contextmenu', this.boundContextMenu);

		this.simulation = forceSimulation<SimulationNode>()
			.force(
				'link',
				forceLink<SimulationNode, SimulationLink>()
					.id((d) => d.id)
					.distance(90)
			)
			.force('charge', forceManyBody().strength(-280))
			.force('center', forceCenter(this.width / 2, this.height / 2))
			.force(
				'collide',
				forceCollide<SimulationNode>().radius((d) => NODE_RADIUS[d.type] + 6)
			)
			.on('tick', () => this.render());
	}

	update(nodes: GraphNode[], links: GraphLink[]) {
		if (!this.simulation) return;

		const nodeMap = new Map(this.simulationNodes.map((n) => [n.id, n]));

		this.simulationNodes = nodes.map((node) => {
			const existing = nodeMap.get(node.id);

			if (existing) {
				return { ...node, x: existing.x, y: existing.y, fx: existing.fx, fy: existing.fy };
			}

			return {
				...node,
				x: this.width / 2 + (Math.random() - 0.5) * 80,
				y: this.height / 2 + (Math.random() - 0.5) * 80
			};
		});

		this.simulationLinks = links.map((link) => ({ ...link }));

		this.simulation.nodes(this.simulationNodes);
		(this.simulation.force('link') as ForceLink<SimulationNode, SimulationLink>).links(
			this.simulationLinks
		);
		this.simulation.force('center', forceCenter(this.width / 2, this.height / 2));
		this.simulation.alpha(0.5).restart();
		this.render();
	}

	setSelectedId(id: string | null): void {
		this.selectedId = id;
		this.render();
	}

	setHighlightedEdgeType(type: EdgeType | null): void {
		this.highlightedEdgeType = type;
		this.render();
	}

	setShowNodeLabels(show: boolean): void {
		this.showNodeLabels = show;
		this.render();
	}

	clear() {
		if (!this.simulation) return;

		this.simulationNodes = [];
		this.simulationLinks = [];
		this.simulation.nodes([]);
		(this.simulation.force('link') as ForceLink<SimulationNode, SimulationLink>).links([]);
		this.simulation.alpha(0).stop();

		this.tooltipText = null;
		this.selectedId = null;
		this.highlightedEdgeType = null;
		this.draggedNode = null;
		this.wasDragged = false;
		this.options.onTooltip(null);
		this.render();
	}

	resetZoom() {
		if (!this.canvasSelection) return;

		this.canvasSelection.transition().duration(300).call(this.zoomBehavior.transform, zoomIdentity);
	}

	resize() {
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;
		this.resizeCanvas();
		this.simulation?.force('center', forceCenter(this.width / 2, this.height / 2));
		this.simulation?.alpha(0.5).restart();
		this.render();
	}

	destroy() {
		this.simulation?.stop();
		this.simulation = null;

		if (this.canvas) {
			this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
			this.canvas.removeEventListener('pointermove', this.boundPointerMove);
			this.canvas.removeEventListener('pointerup', this.boundPointerUp);
			this.canvas.removeEventListener('pointercancel', this.boundPointerUp);
			this.canvas.removeEventListener('click', this.boundClick);
			this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
		}

		this.ctx = null;
		this.canvasSelection = null;
	}
}
