import { useState, useCallback, useRef, useEffect } from "react";

const STORAGE_KEY = "dz-home-widget-order";

export function useDragReorder(defaultOrder: string[]) {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        // Merge: keep saved order for items that still exist, append new ones
        const known = new Set(defaultOrder);
        const result = parsed.filter(id => known.has(id));
        for (const id of defaultOrder) {
          if (!result.includes(id)) result.push(id);
        }
        return result;
      }
    } catch {}
    return defaultOrder;
  });

  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  const onDragStart = useCallback((id: string) => (e: React.DragEvent) => {
    dragItem.current = id;
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image — we'll use the visual style instead
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
  }, []);

  const onDragOver = useCallback((id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverItem.current = id;
    setDragOver(id);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const onDrop = useCallback((id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragItem.current;
    const to = id;
    if (from && to && from !== to) {
      setOrder(prev => {
        const next = [...prev];
        const fromIdx = next.indexOf(from);
        const toIdx = next.indexOf(to);
        if (fromIdx === -1 || toIdx === -1) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, from);
        return next;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(null);
    setDragOver(null);
  }, []);

  const onDragEnd = useCallback(() => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(null);
    setDragOver(null);
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(defaultOrder);
    localStorage.removeItem(STORAGE_KEY);
  }, [defaultOrder]);

  return {
    order,
    dragging,
    dragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    resetOrder,
  };
}
