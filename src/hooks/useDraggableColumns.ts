import { useState, useRef, useCallback } from "react";

/**
 * Hook for draggable column reordering on tables.
 * Returns column order state and drag event handlers for <th> elements.
 */
export function useDraggableColumns<T extends string>(initialColumns: T[]) {
  const [columns, setColumns] = useState<T[]>(initialColumns);
  const dragCol = useRef<number | null>(null);
  const dragOverCol = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const onDragStart = useCallback((idx: number) => {
    dragCol.current = idx;
    setDraggingIdx(idx);
  }, []);

  const onDragEnter = useCallback((idx: number) => {
    dragOverCol.current = idx;
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragCol.current !== null && dragOverCol.current !== null && dragCol.current !== dragOverCol.current) {
      setColumns(prev => {
        const copy = [...prev];
        const dragged = copy.splice(dragCol.current!, 1)[0];
        copy.splice(dragOverCol.current!, 0, dragged);
        return copy;
      });
    }
    dragCol.current = null;
    dragOverCol.current = null;
    setDraggingIdx(null);
  }, []);

  const getThProps = useCallback((idx: number) => ({
    draggable: true,
    onDragStart: () => onDragStart(idx),
    onDragEnter: () => onDragEnter(idx),
    onDragEnd,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    style: {
      cursor: "grab",
      opacity: draggingIdx === idx ? 0.4 : 1,
      transition: "opacity 0.15s",
      userSelect: "none" as const,
    },
  }), [draggingIdx, onDragStart, onDragEnter, onDragEnd]);

  return { columns, getThProps, draggingIdx };
}
