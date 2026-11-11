'use client';

import React from 'react';
import { X, Check, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  isCustom?: boolean;
  locked?: boolean;
}

interface ColumnManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onChangeColumns: (newCols: ColumnDef[]) => void;
  onResetColumns: () => void;
}

export function ColumnManagerModal({
  isOpen,
  onClose,
  columns,
  onChangeColumns,
  onResetColumns,
}: ColumnManagerModalProps) {
  if (!isOpen) return null;

  const toggleVisibility = (id: string) => {
    const target = columns.find((c) => c.id === id);
    if (target?.locked) return;
    const updated = columns.map((col) =>
      col.id === id ? { ...col, visible: !col.visible } : col
    );
    onChangeColumns(updated);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= columns.length) return;

    const updated = [...columns];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChangeColumns(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Manage Register Columns</h3>
            <p className="text-xs text-slate-400">
              Customize visible fields and reorder columns (including dynamic future sheet fields)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 text-sm">
          {columns.map((col, idx) => (
            <div
              key={col.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                col.visible
                  ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                  : 'bg-slate-950/30 border-slate-850 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleVisibility(col.id)}
                  className={`p-1.5 rounded border transition-colors ${
                    col.visible
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={col.visible ? 'Hide Column' : 'Show Column'}
                >
                  {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div>
                  <span className="font-medium text-xs sm:text-sm">{col.label}</span>
                  {col.isCustom && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      Sheet Field
                    </span>
                  )}
                </div>
              </div>

              {/* Reordering arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveColumn(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                  title="Move Left/Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === columns.length - 1}
                  onClick={() => moveColumn(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                  title="Move Right/Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetColumns}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Default
          </Button>
          <Button variant="primary" size="sm" onClick={onClose} icon={<Check className="w-3.5 h-3.5" />}>
            Save Layout
          </Button>
        </div>
      </div>
    </div>
  );
}
