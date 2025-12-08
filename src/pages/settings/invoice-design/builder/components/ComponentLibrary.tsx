/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Palette, FileText, Database, LayoutGrid } from 'lucide-react';
import { blockLibrary } from '../block-library';
import { Block, BlockDefinition } from '../types';

interface ComponentLibraryProps {
  onAddBlock: (block: Block) => void;
  onDragStart?: (definition: BlockDefinition) => void;
}

export function ComponentLibrary({ onAddBlock, onDragStart }: ComponentLibraryProps) {
  const [t] = useTranslation();

  const categories = [
    { id: 'branding', name: t('branding'), icon: <Palette className="w-4 h-4" /> },
    { id: 'content', name: t('content'), icon: <FileText className="w-4 h-4" /> },
    { id: 'data', name: t('data'), icon: <Database className="w-4 h-4" /> },
    { id: 'layout', name: t('layout'), icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  const handleAddBlock = (definition: BlockDefinition) => {
    const newBlock: Block = {
      id: `${definition.type}-${Date.now()}`,
      type: definition.type,
      gridPosition: {
        x: 0,
        y: 0, // Will be repositioned by parent
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
      },
      properties: { ...definition.defaultProperties },
    };

    onAddBlock(newBlock);
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const blocks = blockLibrary.filter((b) => b.category === category.id);

        if (blocks.length === 0) return null;

        return (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
              {category.icon}
              {category.name}
            </h3>

            <div className="space-y-2">
              {blocks.map((definition) => (
                <BlockCard
                  key={definition.type}
                  definition={definition}
                  onClick={() => handleAddBlock(definition)}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface BlockCardProps {
  definition: BlockDefinition;
  onClick: () => void;
  onDragStart?: (definition: BlockDefinition) => void;
}

function BlockCard({ definition, onClick, onDragStart: onDragStartProp }: BlockCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    console.log('🚀 Drag started for:', definition.type);
    // CRITICAL for Firefox compatibility
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(definition));
    console.log('📋 Set data:', JSON.stringify(definition));
    onDragStartProp?.(definition);
    console.log('✅ Called onDragStart prop');
  };

  return (
    <button
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      className="
        w-full flex items-start gap-3 p-3 rounded-lg
        border border-gray-200 hover:border-blue-500
        bg-white hover:bg-blue-50
        transition-all duration-150
        text-left group cursor-move
        active:scale-95
      "
    >
      <div className="text-gray-600 group-hover:text-blue-600 transition-colors mt-0.5">
        {definition.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 mb-0.5 flex items-center gap-2">
          {definition.label}
          {definition.essential && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-normal">
              Essential
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 line-clamp-2">
          {definition.description}
        </div>
      </div>

      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </button>
  );
}
