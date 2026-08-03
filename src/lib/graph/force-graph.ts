import {
	drag,
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	select,
	zoom,
	zoomIdentity
} from 'd3';

import type {
	DragBehavior,
	ForceLink,
	Selection,
	Simulation,
	SimulationLinkDatum,
	SubjectPosition,
	ZoomBehavior
} from 'd3';

import { NODE_COLORS, NODE_RADIUS } from './constants';
import type { GraphLink, GraphNode } from './types';

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
	onTooltip: (tooltip: ForceGraphTooltip | null) => void;
}

interface ForceGraphHighlight {
	selectedId: string | null;
	seedId: string | null;
}

export class ForceGraph {
	private container: HTMLElement;
	private options: ForceGraphOptions;
	private width = 800;
	private height = 600;

	private svg: Selection<SVGSVGElement, unknown, null, undefined> | null = null;
	private gLinks: Selection<SVGGElement, unknown, null, undefined> | null = null;
	private gNodes: Selection<SVGGElement, unknown, null, undefined> | null = null;
	private gLabels: Selection<SVGGElement, unknown, null, undefined> | null = null;
	private gRoot: Selection<SVGGElement, unknown, null, undefined> | null = null;
	private simulation: Simulation<SimulationNode, SimulationLink> | null = null;
	private simulationNodes: SimulationNode[] = [];
	private simulationLinks: SimulationLink[] = [];
	private tooltipText: string | null = null;

	private dragBehavior: DragBehavior<SVGGElement, SimulationNode, SimulationNode | SubjectPosition> =
		drag<SVGGElement, SimulationNode>()
			.on('start', (event, d) => {
				if (!event.active) this.simulation?.alphaTarget(0.5).restart();
				d.fx = d.x;
				d.fy = d.y;
			})
			.on('drag', (event, d) => {
				d.fx = event.x;
				d.fy = event.y;
			})
			.on('end', (event, d) => {
				if (!event.active) this.simulation?.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			});
	
	private zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> =
		zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.2, 4])
			.on('zoom', event => {
				this.gRoot?.attr('transform', event.transform);
			});


	constructor(container: HTMLElement, options: ForceGraphOptions) {
		this.container = container;
		this.options = options;
		this.setup();
	}

	private setup() {
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		select(this.container).selectAll('*').remove();

		this.svg = select(this.container)
			.append('svg')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [0, 0, this.width, this.height]);

		this.gRoot = this.svg.append('g');
		this.gLinks = this.gRoot.append('g').attr('class', 'links');
		this.gNodes = this.gRoot.append('g').attr('class', 'nodes');
		this.gLabels = this.gRoot.append('g').attr('class', 'labels');

		this.svg.call(this.zoomBehavior);

		this.simulation = forceSimulation<SimulationNode>()
			.force(
				'link',
				forceLink<SimulationNode, SimulationLink>()
					.id(d => d.id)
					.distance(90)
			)
			.force('charge', forceManyBody().strength(-280))
			.force('center', forceCenter(this.width / 2, this.height / 2))
			.force(
				'collide',
				forceCollide<SimulationNode>().radius(d => NODE_RADIUS[d.type] + 6)
			)
			.on('tick', () => {
				this.gLinks
					?.selectAll<SVGLineElement, SimulationLink>('line')
					.attr('x1', d => (d.source as SimulationNode).x ?? 0)
					.attr('y1', d => (d.source as SimulationNode).y ?? 0)
					.attr('x2', d => (d.target as SimulationNode).x ?? 0)
					.attr('y2', d => (d.target as SimulationNode).y ?? 0);

				this.gNodes
					?.selectAll<SVGGElement, SimulationNode>('g.node')
					.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);

				this.gLabels
					?.selectAll<SVGTextElement, SimulationNode>('text')
					.attr('x', d => d.x ?? 0)
					.attr('y', d => (d.y ?? 0) + 4);
			});
	}

	update(nodes: GraphNode[], links: GraphLink[], highlight: ForceGraphHighlight) {
		if (!this.simulation || !this.gLinks || !this.gNodes || !this.gLabels) return;

		const nodeMap = new Map(this.simulationNodes.map(n => [n.id, n]));

		this.simulationNodes = nodes.map(node => {
			const existing = nodeMap.get(node.id);

			if (existing) return { ...node, x: existing.x, y: existing.y, fx: existing.fx, fy: existing.fy };

			return {
				...node,
				x: this.width / 2 + (Math.random() - 0.5) * 80,
				y: this.height / 2 + (Math.random() - 0.5) * 80
			};
		});

		this.simulationLinks = links.map(link => ({ ...link }));

		this.gLinks
			.selectAll<SVGLineElement, SimulationLink>('line')
			.data(this.simulationLinks, d => d.id)
			.join('line')
			.attr('stroke', '#999')
			.attr('stroke-opacity', 0.6)
			.attr('stroke-width', 1.5);

		const nodeGroups = this.gNodes
			.selectAll<SVGGElement, SimulationNode>('g.node')
			.data(this.simulationNodes, d => d.id)
			.join(
				enter => {
					const g = enter.append('g').attr('class', 'node').style('cursor', 'pointer').call(this.dragBehavior);

					g.append('circle').attr('class', 'node-circle');
					return g;
				},
				update => update,
				exit => exit.remove()
			);

		nodeGroups
			.select('circle')
			.attr('r', d => NODE_RADIUS[d.type])
			.attr('fill', d => NODE_COLORS[d.type])
			.attr('stroke', d =>
				d.id === highlight.selectedId || d.id === highlight.seedId ? '#fff' : 'none'
			)
			.attr('stroke-width', d => (d.id === highlight.seedId ? 3 : 2));

		const { onNodeClick, onTooltip } = this.options;

		nodeGroups
			.on('click', (_, d) => onNodeClick(d.id))
			.on('mouseenter', (event, d) => {
				const meta = [d.type, d.meta?.year ? String(d.meta.year) : null, d.meta?.role ?? null]
					.filter(Boolean)
					.join(' · ');
				this.tooltipText = `${d.displayName}${meta ? ` (${meta})` : ''}`;
				onTooltip({
					x: event.clientX,
					y: event.clientY,
					text: this.tooltipText
				});
			})
			.on('mousemove', event => {
				if (!this.tooltipText) return;
				onTooltip({
					x: event.clientX,
					y: event.clientY,
					text: this.tooltipText
				});
			})
			.on('mouseleave', () => {
				this.tooltipText = null;
				onTooltip(null);
			});

		this.gLabels
			.selectAll<SVGTextElement, SimulationNode>('text')
			.data(
				this.simulationNodes.filter(n => n.type !== 'track'),
				d => d.id
			)
			.join('text')
			.text(d =>
				d.displayName.length > 24 ? `${d.displayName.slice(0, 22)}…` : d.displayName
			)
			.attr('font-size', 10)
			.attr('fill', '#ddd')
			.attr('text-anchor', 'middle')
			.attr('pointer-events', 'none');

		this.simulation.nodes(this.simulationNodes);

		(this.simulation.force('link') as ForceLink<SimulationNode, SimulationLink>).links(
			this.simulationLinks
		);

		this.simulation.force('center', forceCenter(this.width / 2, this.height / 2));
		this.simulation.alpha(0.5).restart();
	}

	clear() {
		if (!this.simulation || !this.gLinks || !this.gNodes || !this.gLabels) return;

		this.simulationNodes = [];
		this.simulationLinks = [];

		this.gLinks.selectAll('line').remove();
		this.gNodes.selectAll('g.node').remove();
		this.gLabels.selectAll('text').remove();

		this.simulation.nodes([]);
		(this.simulation.force('link') as ForceLink<SimulationNode, SimulationLink>).links([]);
		this.simulation.alpha(0).stop();

		this.tooltipText = null;
		this.options.onTooltip(null);
	}

	resetZoom() {
		if (!this.svg || !this.zoomBehavior) return;

		this.svg.transition().duration(300).call(this.zoomBehavior.transform, zoomIdentity);
	}

	resize() {
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		this.svg
			?.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', [0, 0, this.width, this.height]);

		this.simulation?.force('center', forceCenter(this.width / 2, this.height / 2));
		this.simulation?.alpha(0.5).restart();
	}

	destroy() {
		this.simulation?.stop();
		this.simulation = null;

		select(this.container).selectAll('*').remove();

		this.svg = null;
		this.gRoot = null;
		this.gLinks = null;
		this.gNodes = null;
		this.gLabels = null;
	}
}
