import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Settings,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'

// Column definition type
export interface ColumnDef<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => any)
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
  frozen?: boolean
  visible?: boolean
  hidden?: boolean
  editable?: boolean
  editType?: 'text' | 'select' | 'multiselect' | 'user' | 'tags' | 'priority' | 'status'
  editOptions?: { value: string; label: string; color?: string }[]
  render?: (value: any, row: T, isEditing: boolean, onSave: (value: any) => void) => React.ReactNode
}

export interface DataGridProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey: keyof T
  selectedIds?: string[]
  onRowClick?: (row: T) => void
  onSelectionChange?: (id: string, selected: boolean) => void
  frozenColumnCount?: number
  className?: string
}

interface ColumnState {
  id: string
  width: number
  visible: boolean
  order: number
}

export function DataGrid<T extends { id: string }>({
  data,
  columns: initialColumns,
  rowKey,
  selectedIds = [],
  onRowClick,
  onSelectionChange,
  frozenColumnCount = 2,
  className = '',
}: DataGridProps<T>) {
  // Column state management
  const [columnStates, setColumnStates] = useState<ColumnState[]>(() =>
    initialColumns.map((col, idx) => ({
      id: col.id,
      width: col.width || 150,
      visible: col.visible !== false && col.hidden !== true,
      order: idx,
    }))
  )

  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  const tableRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  // Get ordered and visible columns
  const orderedColumns = [...columnStates]
    .sort((a, b) => a.order - b.order)
    .filter((cs) => cs.visible)
    .map((cs) => ({
      ...initialColumns.find((c) => c.id === cs.id)!,
      width: cs.width,
    }))

  // Calculate frozen column widths
  const frozenColumns = orderedColumns.slice(0, frozenColumnCount)
  const scrollableColumns = orderedColumns.slice(frozenColumnCount)

  const getFrozenLeftOffset = (index: number) => {
    let offset = 48 // checkbox column width
    for (let i = 0; i < index; i++) {
      offset += frozenColumns[i]?.width || 150
    }
    return offset
  }

  // Column resizing handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(columnId)
    startXRef.current = e.clientX
    const col = columnStates.find((c) => c.id === columnId)
    startWidthRef.current = col?.width || 150
  }, [columnStates])

  useEffect(() => {
    if (!resizingColumn) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current
      const newWidth = Math.max(80, Math.min(500, startWidthRef.current + diff))
      setColumnStates((prev) =>
        prev.map((cs) => (cs.id === resizingColumn ? { ...cs, width: newWidth } : cs))
      )
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingColumn])

  // Column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setColumnStates((prev) =>
      prev.map((cs) => (cs.id === columnId ? { ...cs, visible: !cs.visible } : cs))
    )
  }

  // Column reordering
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId)
  }

  const handleDragOver = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnId) return

    setColumnStates((prev) => {
      const draggedIdx = prev.findIndex((c) => c.id === draggedColumn)
      const targetIdx = prev.findIndex((c) => c.id === targetColumnId)
      const newStates = [...prev]
      const draggedOrder = newStates[draggedIdx].order
      const targetOrder = newStates[targetIdx].order

      newStates[draggedIdx].order = targetOrder
      newStates[targetIdx].order = draggedOrder

      return newStates
    })
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
  }

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row)
    }
    return row[column.accessor]
  }

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <div className="absolute -top-10 right-0 z-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Settings className="h-4 w-4" />
          Columns
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Column Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag to reorder, toggle visibility
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {[...columnStates]
                  .sort((a, b) => a.order - b.order)
                  .map((cs) => {
                    const col = initialColumns.find((c) => c.id === cs.id)
                    return (
                      <div
                        key={cs.id}
                        draggable
                        onDragStart={() => handleDragStart(cs.id)}
                        onDragOver={(e) => handleDragOver(e, cs.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex cursor-grab items-center gap-2 rounded px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          draggedColumn === cs.id ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                          {col?.header}
                        </span>
                        <button
                          onClick={() => toggleColumnVisibility(cs.id)}
                          className={`rounded p-1 transition-colors ${
                            cs.visible
                              ? 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-950'
                              : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {cs.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table Container */}
      <div
        ref={tableRef}
        className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        style={{ width: '100%', overflow: 'visible' }}
      >
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: '100%' }}>
          {/* Header */}
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {/* Checkbox Column - Always Frozen */}
              <th
                className="sticky left-0 z-20 w-12 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                style={{ minWidth: 48 }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                />
              </th>

              {/* Frozen Columns */}
              {frozenColumns.map((column, index) => (
                <th
                  key={column.id}
                  className="sticky z-20 border-b border-r border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800"
                  style={{
                    left: getFrozenLeftOffset(index),
                    width: column.width,
                    minWidth: column.minWidth || 80,
                    maxWidth: column.maxWidth || 400,
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {column.header}
                    </span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-indigo-400"
                      onMouseDown={(e) => handleResizeStart(e, column.id)}
                    />
                  </div>
                </th>
              ))}

              {/* Scrollable Columns */}
              {scrollableColumns.map((column) => (
                <th
                  key={column.id}
                  className="relative border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800"
                  style={{
                    width: column.flex ? `${column.flex * 100}%` : column.width,
                    minWidth: column.minWidth || 80,
                    maxWidth: column.maxWidth || 400,
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {column.header}
                    </span>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-indigo-400"
                      onMouseDown={(e) => handleResizeStart(e, column.id)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((row) => {
              const rowId = String(row[rowKey])
              const isSelected = selectedIds.includes(rowId)

              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="sticky left-0 z-10 border-r border-slate-200 bg-inherit px-3 py-1.5 dark:border-slate-700"
                    style={{ minWidth: 48 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectionChange?.(rowId, !isSelected)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                    />
                  </td>

                  {/* Frozen Columns */}
                  {frozenColumns.map((column, index) => {
                    const cellValue = getCellValue(row, column)

                    return (
                      <td
                        key={column.id}
                        className={`sticky z-10 border-r border-slate-200 bg-inherit dark:border-slate-700 ${
                          isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : 'bg-white dark:bg-slate-900'
                        }`}
                        style={{
                          left: getFrozenLeftOffset(index),
                          width: column.width,
                        }}
                      >
                        <div className="px-3 py-1.5">
                          {column.render ? (
                            column.render(cellValue, row, false, () => {})
                          ) : (
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                              {String(cellValue ?? '')}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}

                  {/* Scrollable Columns */}
                  {scrollableColumns.map((column) => {
                    const cellValue = getCellValue(row, column)

                    return (
                      <td
                        key={column.id}
                        style={{
                          width: column.flex ? `${column.flex * 100}%` : column.width,
                          wordWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        <div className="px-3 py-1.5">
                          {column.render ? (
                            column.render(cellValue, row, false, () => {})
                          ) : (
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                              {String(cellValue ?? '')}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
