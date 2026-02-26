import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import { FLOW_NODE_DEFAULTS, FLOW_LAYOUT_DEFAULTS } from './flowTheme';

interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

/**
 * dagre 자동 레이아웃 훅.
 * 노드/엣지를 받아 position이 할당된 노드 배열을 반환한다.
 */
export function useAutoLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): { layoutNodes: Node[]; layoutEdges: Edge[] } {
  return useMemo(() => {
    if (nodes.length === 0) return { layoutNodes: [], layoutEdges: edges };

    const {
      direction = FLOW_LAYOUT_DEFAULTS.direction,
      nodeWidth = FLOW_NODE_DEFAULTS.width,
      nodeHeight = FLOW_NODE_DEFAULTS.height,
      rankSep = FLOW_LAYOUT_DEFAULTS.rankSep,
      nodeSep = FLOW_LAYOUT_DEFAULTS.nodeSep,
    } = options;

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, ranksep: rankSep, nodesep: nodeSep });

    for (const node of nodes) {
      const w = (node.measured?.width ?? node.width ?? nodeWidth) as number;
      const h = (node.measured?.height ?? node.height ?? nodeHeight) as number;
      g.setNode(node.id, { width: w, height: h });
    }

    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    const layoutNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      const w = (node.measured?.width ?? node.width ?? nodeWidth) as number;
      const h = (node.measured?.height ?? node.height ?? nodeHeight) as number;
      return {
        ...node,
        position: {
          x: pos.x - w / 2,
          y: pos.y - h / 2,
        },
      };
    });

    return { layoutNodes, layoutEdges: edges };
  }, [nodes, edges, options]);
}
