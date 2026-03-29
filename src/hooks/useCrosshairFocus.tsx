"use client";
import { useState, useCallback, useMemo } from "react";

/**
 * Crosshair Focus hook for data tables.
 *
 * Tracks hoveredRow + hoveredCol. Cells NOT in the hovered row/col dim.
 * Label columns never dim — only data columns participate.
 *
 * @param dataColIndices - Set of column indices (or keys resolved to indices)
 *   that are "data" columns. All other columns are label and never dim.
 */
export function useCrosshairFocus(dataColIndices: Set<number>, externalFocusMode?: boolean) {
  const [internalFocusMode, setFocusMode] = useState(false);
  const focusMode = externalFocusMode ?? internalFocusMode;
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const onCellEnter = useCallback((rowId: string, colIdx: number) => {
    setHoveredRow(rowId);
    setHoveredCol(colIdx);
  }, []);

  const onCellLeave = useCallback(() => {
    setHoveredRow(null);
    setHoveredCol(null);
  }, []);

  const toggleFocus = useCallback(() => {
    setFocusMode(prev => !prev);
    setHoveredRow(null);
    setHoveredCol(null);
  }, []);

  const getCellStyle = useCallback((rowId: string, colIdx: number): React.CSSProperties => {
    if (!focusMode) return {};
    if (hoveredRow === null || hoveredCol === null) return {};
    if (!dataColIndices.has(colIdx)) return {};
    if (rowId === hoveredRow || colIdx === hoveredCol) return {};
    return { opacity: 0.08, transition: "opacity 0.2s ease" };
  }, [focusMode, hoveredRow, hoveredCol, dataColIndices]);

  const getRowStyle = useCallback((rowId: string): React.CSSProperties => {
    if (!focusMode) return {};
    if (hoveredRow === null) return {};
    if (rowId === hoveredRow) return { transition: "opacity 0.2s ease" };
    return { opacity: 0.08, transition: "opacity 0.2s ease" };
  }, [focusMode, hoveredRow]);

  const getTdProps = useCallback((rowId: string, colIdx: number) => ({
    onMouseEnter: () => onCellEnter(rowId, colIdx),
    onMouseLeave: onCellLeave,
    style: {
      ...getCellStyle(rowId, colIdx),
      transition: "opacity 0.2s ease",
    },
  }), [onCellEnter, onCellLeave, getCellStyle]);

  return { focusMode, hoveredRow, hoveredCol, toggleFocus, onCellEnter, onCellLeave, getCellStyle, getRowStyle, getTdProps };
}

/**
 * Variant for tables with draggable/dynamic column order.
 * Pass the current column order and a set of "data" column keys.
 */
export function useCrosshairFocusByKey<K extends string>(columns: K[], dataKeys: Set<K>, externalFocusMode?: boolean) {
  const dataIndices = useMemo(() => {
    const s = new Set<number>();
    columns.forEach((key, i) => { if (dataKeys.has(key)) s.add(i); });
    return s;
  }, [columns, dataKeys]);
  return useCrosshairFocus(dataIndices, externalFocusMode);
}

/**
 * Crosshair Focus toggle button.
 */
export function CrosshairToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={active ? "Disable crosshair focus" : "Enable crosshair focus"}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "6px 8px", borderRadius: "6px",
        border: `1px solid ${active ? "rgba(99,102,241,0.25)" : "rgba(148,163,184,0.15)"}`,
        background: active ? "rgba(99,102,241,0.1)" : "rgba(148,163,184,0.06)",
        color: active ? "#818cf8" : "#64748b",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    </button>
  );
}
