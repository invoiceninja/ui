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
import { Palette, FileText, Database, LayoutGrid, Plus } from 'lucide-react';
import { Button } from '$app/components/forms/Button';
import { useBlockLibrary } from '../block-library';
import { Block, BlockDefinition, generateBlockId } from '../types';

interface ComponentLibraryProps {
  onAddBlock: (block: Block) => void;
  onDragStart?: (definition: BlockDefinition) => void;
}

export function ComponentLibrary({
  onAddBlock,
  onDragStart,
}: ComponentLibraryProps) {
  const [t] = useTranslation();
  const blockLibrary = useBlockLibrary();

  const categories = [
    {
      id: 'branding',
      name: t('branding'),
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'content',
      name: t('content'),
      icon: <FileText className="w-4 h-4" />,
    },
    { id: 'data', name: t('data'), icon: <Database className="w-4 h-4" /> },
    {
      id: 'layout',
      name: t('layout'),
      icon: <LayoutGrid className="w-4 h-4" />,
    },
  ];

  const handleAddBlock = (definition: BlockDefinition) => {
    const newBlock: Block = {
      id: generateBlockId(definition.type),
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

function BlockCard({
  definition,
  onClick,
  onDragStart: onDragStartProp,
}: BlockCardProps) {
  const [t] = useTranslation();

  const handleDragStart = (e: React.DragEvent) => {
    // CRITICAL for Firefox compatibility
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(definition));
    onDragStartProp?.(definition);
  };

  return (
    <div draggable onDragStart={handleDragStart} className="w-full">
      <Button
        behavior="button"
        type="secondary"
        onClick={onClick}
        className="w-full justify-start text-left items-start gap-3 py-3 px-3 h-auto cursor-move"
      >
        <div className="mt-0.5 flex-shrink-0">{definition.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-0.5 flex items-center gap-2">
            {definition.label}
            {definition.essential && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-normal">
                {t('essential')}
              </span>
            )}
          </div>
          <div className="text-xs opacity-75 line-clamp-2">
            {definition.description}
          </div>
        </div>

        <div className="opacity-60 flex-shrink-0 mt-0.5">
          <Plus className="w-4 h-4" />
        </div>
      </Button>
    </div>
  );
}
