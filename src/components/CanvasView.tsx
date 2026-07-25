import React, { useState } from 'react';
import {
  Plus,
  StickyNote,
  FileText,
  Type,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowRight,
  Palette,
} from 'lucide-react';
import { CanvasElement, CanvasConnection, Note } from '../types';

interface CanvasViewProps {
  elements: CanvasElement[];
  connections: CanvasConnection[];
  notes: Record<string, Note>;
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onOpenNote: (noteId: string) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  elements,
  connections,
  notes,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onOpenNote,
}) => {
  const [zoom, setZoom] = useState(1);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedElementId(id);
    const elem = elements.find((el) => el.id === id);
    if (elem) {
      setDragOffset({
        x: e.clientX - elem.x,
        y: e.clientY - elem.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedElementId) {
      onUpdateElement(draggedElementId, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
  };

  const handleAddSticky = () => {
    onAddElement({
      type: 'sticky',
      x: 150 + Math.random() * 100,
      y: 120 + Math.random() * 100,
      width: 220,
      height: 160,
      title: '📌 Sticky Idea',
      content: 'Double click to edit note content...',
      color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100',
    });
  };

  const handleAddNoteCard = () => {
    onAddElement({
      type: 'note',
      x: 200 + Math.random() * 100,
      y: 150 + Math.random() * 100,
      width: 260,
      height: 180,
      title: '📄 Connected Note',
      content: 'Linked note card on infinite canvas surface.',
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100',
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full bg-gray-100 dark:bg-gray-950 overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(156, 163, 175, 0.2) 1px, transparent 1px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
      }}
    >
      {/* Top Canvas Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-1.5 rounded-xl shadow-xl">
        <button
          onClick={handleAddSticky}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 shadow-2xs transition-all active:scale-95"
        >
          <StickyNote size={14} />
          <span>Add Sticky</span>
        </button>

        <button
          onClick={handleAddNoteCard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent/90 shadow-2xs transition-all active:scale-95"
        >
          <FileText size={14} />
          <span>Add Note Card</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 my-auto" />

        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
      </div>

      {/* Render Connection Arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {connections.map((conn) => {
          const fromElem = elements.find((e) => e.id === conn.fromId);
          const toElem = elements.find((e) => e.id === conn.toId);
          if (!fromElem || !toElem) return null;

          const x1 = fromElem.x + fromElem.width / 2;
          const y1 = fromElem.y + fromElem.height / 2;
          const x2 = toElem.x + toElem.width / 2;
          const y2 = toElem.y + toElem.height / 2;

          return (
            <g key={conn.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={conn.color || '#3b82f6'}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              {conn.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  fill="#6b7280"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-mono font-bold"
                >
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Canvas Elements */}
      <div
        className="w-full h-full relative"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {elements.map((elem) => {
          const isEditing = editingElementId === elem.id;

          return (
            <div
              key={elem.id}
              onMouseDown={(e) => handleMouseDown(elem.id, e)}
              style={{
                left: `${elem.x}px`,
                top: `${elem.y}px`,
                width: `${elem.width}px`,
                height: `${elem.height}px`,
              }}
              className={`absolute p-3 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-2xl flex flex-col justify-between ${
                elem.color || 'bg-white dark:bg-gray-900'
              }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                <div className="font-bold text-xs truncate flex-1 pr-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={elem.title || ''}
                      onChange={(e) =>
                        onUpdateElement(elem.id, { title: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-gray-400 font-bold text-xs outline-none"
                    />
                  ) : (
                    <span>{elem.title || 'Untitled Card'}</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {elem.noteId && (
                    <button
                      onClick={() => onOpenNote(elem.noteId!)}
                      title="Open full note"
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-xs"
                    >
                      ↗
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteElement(elem.id)}
                    title="Delete Card"
                    className="p-1 rounded hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 text-xs"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div
                onDoubleClick={() => setEditingElementId(elem.id)}
                className="flex-1 my-2 overflow-y-auto text-xs leading-relaxed"
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={elem.content}
                    onChange={(e) =>
                      onUpdateElement(elem.id, { content: e.target.value })
                    }
                    onBlur={() => setEditingElementId(null)}
                    className="w-full h-full bg-transparent border-0 outline-none resize-none text-xs"
                  />
                ) : (
                  <p>{elem.content}</p>
                )}
              </div>

              {/* Footer instruction */}
              <div className="text-[9px] opacity-60 text-right italic">
                Double-click to edit
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
