'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Shield, Folder, FileText, Check } from 'lucide-react';
import { CategoryHierarchyNode, IncidentCategory } from '@/lib/types/incident';

interface CategoryTreeProps {
  categories: CategoryHierarchyNode[];
  selectedCategory: string | null;
  selectedType: string | null;
  onSelectNode: (category: IncidentCategory | null, type: string | null) => void;
}

export function CategoryTree({
  categories,
  selectedCategory,
  selectedType,
  onSelectNode,
}: CategoryTreeProps) {
  // Keep all expanded by default
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    Security: true,
    Safety: true,
    Utilities: true,
    Community: true,
    Infrastructure: true,
  });

  const toggleExpand = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-1">
      {/* "All Categories" root button */}
      <div
        onClick={() => onSelectNode(null, null)}
        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
          !selectedCategory && !selectedType
            ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40'
            : 'text-slate-300 hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span>All Incident Categories</span>
        </div>
        {!selectedCategory && !selectedType && <Check className="w-3 h-3 text-blue-400" />}
      </div>

      {/* Category Tree Hierarchy */}
      {categories.map((node) => {
        const isExpanded = !!expandedCats[node.category];
        const isCatSelected = selectedCategory === node.category && !selectedType;

        return (
          <div key={node.category} className="space-y-0.5">
            {/* Category Header Node */}
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                isCatSelected
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <div
                className="flex items-center gap-1.5 flex-1"
                onClick={() => onSelectNode(node.category, null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <span className="font-semibold">{node.category}</span>
                <span className="text-[11px] text-slate-500 font-mono">({node.count})</span>
              </div>

              {/* Expand/Collapse Chevron */}
              {node.types.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.category);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Child Incident Types */}
            {isExpanded && node.types.length > 0 && (
              <div className="ml-5 pl-2 border-l border-slate-800 space-y-0.5 py-0.5">
                {node.types.map((typeNode) => {
                  const isTypeSelected =
                    selectedCategory === node.category && selectedType === typeNode.name;

                  return (
                    <div
                      key={typeNode.name}
                      onClick={() => onSelectNode(node.category, typeNode.name)}
                      className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                        isTypeSelected
                          ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-600">├</span>
                        <span className="truncate">{typeNode.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px] shrink-0 ml-1">
                        {typeNode.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
