import { useMemo } from "react";
import ReactFlow, {
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import { Code, Plus } from "lucide-react";
import "reactflow/dist/style.css";
import { Button } from "./button";
import { Service } from "@/lib/types";

/* -------------------------- Custom node UI ------------------------------ */
function ServiceNode({ data }: { data: Service }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-md cursor-pointer">
      {data.icon ? (
        <img src={data.icon} alt="" className="h-6 w-6 object-contain" />
      ) : (
        <Code className="h-6 w-6 text-gray-400" />
      )}
      <span className="font-medium">{data.name}</span>
    </div>
  );
}

const nodeTypes = { service: ServiceNode };

type Props = {
  data: Service[]
  onServiceClick?: (id: string) => void
  onAdd?: () => void
}

export function ServiceFlow({ data, onServiceClick, onAdd }: Props) {
  /* turn the data array into React-Flow nodes ---------------------------- */
  const initialNodes: Node[] = useMemo(
    () =>
      data.map((node, i) => ({
        id: node.id,
        type: "service",
        position: {
          x: (i % 3) * 220, // simple 3-col grid
          y: Math.floor(i / 3) * 140,
        },
        data: { name: node.name, icon: node.icon ?? undefined },
      })),
    [data],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge[]>([]);

  return (
    <div className="w-full h-[80vh] border border-gray-200 rounded-lg relative">
      <Button
        variant="outline"
        size="lg"
        onClick={() => onAdd?.()}
        className="absolute top-8 right-8 z-10 cursor-pointer shadow-md"
      >
        <Plus className="h-4 w-4" />
        Create
      </Button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        snapToGrid
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        onInit={(instance) => {
          // ❷  after fitView runs, shift the camera up & tweak zoom
          const { x, y, zoom } = instance.getViewport();
          instance.setViewport({ x: x + 30, y: y - 50, zoom: zoom * 0.8 });
        }}
        onNodeClick={(_, node) => onServiceClick?.(node.id)}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
