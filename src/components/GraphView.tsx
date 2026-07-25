import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Filter, Search, Maximize2 } from 'lucide-react';
import { Note, GraphNode, GraphLink } from '../types';
import { extractWikiLinks } from '../lib/markdown';

interface GraphViewProps {
  notes: Record<string, Note>;
  activeNoteId: string | null;
  onOpenNote: (noteId: string) => void;
  theme: 'mac-dark' | 'mac-light';
}

export const GraphView: React.FC<GraphViewProps> = ({
  notes,
  activeNoteId,
  onOpenNote,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize nodes and links from notes state
  const initGraphData = useCallback(() => {
    const notesList = Object.values(notes) as Note[];
    const nodeMap = new Map<string, GraphNode>();
    const titleToIdMap = new Map<string, string>();
    const links: GraphLink[] = [];

    // Map titles to IDs
    notesList.forEach((n) => {
      titleToIdMap.set(n.title.toLowerCase().trim(), n.id);
    });

    // Create Nodes
    const width = window.innerWidth || 800;
    const height = window.innerHeight || 600;

    notesList.forEach((note, idx) => {
      // Calculate angle for initial circular layout
      const angle = (idx / notesList.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.25 + Math.random() * 50;

      nodeMap.set(note.id, {
        id: note.id,
        title: note.title,
        backlinkCount: 0,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    });

    // Create Links & Count Backlinks
    notesList.forEach((note) => {
      const wikiLinks = extractWikiLinks(note.content);
      wikiLinks.forEach((wl) => {
        const targetId = titleToIdMap.get(wl.title.toLowerCase().trim());
        if (targetId && targetId !== note.id) {
          links.push({ source: note.id, target: targetId });

          const srcNode = nodeMap.get(note.id);
          const tgtNode = nodeMap.get(targetId);
          if (srcNode) srcNode.backlinkCount += 1;
          if (tgtNode) tgtNode.backlinkCount += 1;
        }
      });
    });

    nodesRef.current = Array.from(nodeMap.values());
    linksRef.current = links;
  }, [notes]);

  useEffect(() => {
    initGraphData();
  }, [initGraphData]);

  // Physics Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const runPhysicsAndRender = () => {
      if (!isRunning) return;

      const nodes = nodesRef.current;
      const links = linksRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Filter nodes if search query provided
      const activeQuery = filterQuery.toLowerCase().trim();
      const visibleNodes = nodes.filter((n) =>
        activeQuery ? n.title.toLowerCase().includes(activeQuery) : true
      );
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

      const visibleLinks = links.filter(
        (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
      );

      // --- Physics Forces ---
      // Repulsion between nodes
      for (let i = 0; i < visibleNodes.length; i++) {
        for (let j = i + 1; j < visibleNodes.length; j++) {
          const n1 = visibleNodes[i];
          const n2 = visibleNodes[j];
          if (!n1.x || !n1.y || !n2.x || !n2.y) continue;

          let dx = n2.x - n1.x;
          let dy = n2.y - n1.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 220) {
            const force = (220 - dist) / dist * 0.08;
            if (n1 !== draggedNode) {
              n1.vx = (n1.vx || 0) - dx * force;
              n1.vy = (n1.vy || 0) - dy * force;
            }
            if (n2 !== draggedNode) {
              n2.vx = (n2.vx || 0) + dx * force;
              n2.vy = (n2.vy || 0) + dy * force;
            }
          }
        }
      }

      // Attraction along links
      visibleLinks.forEach((link) => {
        const src = visibleNodes.find((n) => n.id === link.source);
        const tgt = visibleNodes.find((n) => n.id === link.target);
        if (!src || !tgt || !src.x || !src.y || !tgt.x || !tgt.y) return;

        let dx = tgt.x - src.x;
        let dy = tgt.y - src.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (dist - 120) * 0.005;
        if (src !== draggedNode) {
          src.vx = (src.vx || 0) + dx * force;
          src.vy = (src.vy || 0) + dy * force;
        }
        if (tgt !== draggedNode) {
          tgt.vx = (tgt.vx || 0) - dx * force;
          tgt.vy = (tgt.vy || 0) - dy * force;
        }
      });

      // Center gravity & damping
      const cx = width / 2;
      const cy = height / 2;
      visibleNodes.forEach((node) => {
        if (node === draggedNode) return;
        if (!node.x || !node.y) return;

        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx = ((node.vx || 0) + dx * 0.0005) * 0.85; // Damping
        node.vy = ((node.vy || 0) + dy * 0.0005) * 0.85;

        node.x += node.vx;
        node.y += node.vy;
      });

      // --- Rendering ---
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Pan & Zoom Transform
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const isDark = theme === 'mac-dark';

      // Draw Links
      visibleLinks.forEach((link) => {
        const src = visibleNodes.find((n) => n.id === link.source);
        const tgt = visibleNodes.find((n) => n.id === link.target);
        if (!src || !tgt || !src.x || !src.y || !tgt.x || !tgt.y) return;

        const isHighlighted =
          hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = isHighlighted
          ? '#3b82f6'
          : isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1;
        ctx.stroke();
      });

      // Draw Nodes
      visibleNodes.forEach((node) => {
        if (!node.x || !node.y) return;

        const isSelected = node.id === activeNoteId;
        const isHovered = hoveredNode?.id === node.id;

        // Radius scales with backlink count
        const radius = Math.min(18, 6 + node.backlinkCount * 2.5);

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = '#10b981'; // Emerald for selected
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
        } else if (isHovered) {
          ctx.fillStyle = '#3b82f6'; // Accent Blue
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
          ctx.shadowBlur = 0;
        }

        ctx.fill();

        // Node Outer Ring
        ctx.lineWidth = 2;
        ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.stroke();

        // Node Label
        ctx.shadowBlur = 0;
        ctx.font = `${isHovered || isSelected ? 'bold' : 'normal'} ${
          Math.max(10, 11 / zoom)
        }px system-ui, sans-serif`;
        ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(node.title, node.x, node.y + radius + 14);
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(runPhysicsAndRender);
    };

    runPhysicsAndRender();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, zoom, pan, filterQuery, activeNoteId, hoveredNode, draggedNode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 800;
        canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || 600;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interaction Handlers
  const getCanvasCoords = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    const clickedNode = nodesRef.current.find((n) => {
      if (!n.x || !n.y) return false;
      const dx = coords.x - n.x;
      const dy = coords.y - n.y;
      return Math.sqrt(dx * dx + dy * dy) <= Math.max(12, 6 + n.backlinkCount * 2.5);
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      const coords = getCanvasCoords(e);
      draggedNode.x = coords.x;
      draggedNode.y = coords.y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      // Hover detection
      const coords = getCanvasCoords(e);
      const hovered = nodesRef.current.find((n) => {
        if (!n.x || !n.y) return false;
        const dx = coords.x - n.x;
        const dy = coords.y - n.y;
        return Math.sqrt(dx * dx + dy * dy) <= Math.max(12, 6 + n.backlinkCount * 2.5);
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedNode) {
      // If clicked without dragging far, trigger open note
      onOpenNote(draggedNode.id);
      setDraggedNode(null);
    }
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(3, Math.max(0.3, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950/95 dark:bg-gray-950 text-white select-none">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Control Toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-gray-800 p-1.5 rounded-xl shadow-2xl">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter nodes..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-7 pr-2 py-1 bg-gray-800 text-xs rounded-md text-white border border-gray-700/50 focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>

        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            initGraphData();
          }}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300"
          title="Reset Graph Layout"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Node Info Hover Badge */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-blue-500/40 p-3 rounded-xl shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
            <Network size={14} />
            <span>{hoveredNode.title}</span>
          </div>
          <div className="text-xs text-gray-300">
            Connections: <strong className="text-white">{hoveredNode.backlinkCount}</strong> links
          </div>
          <div className="text-[10px] text-gray-400 italic">Click node to navigate to note</div>
        </div>
      )}
    </div>
  );
};
