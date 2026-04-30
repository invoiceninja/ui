/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  FileText,
  Database,
  LayoutGrid,
  GripVertical,
} from 'lucide-react';
import { useColorScheme } from '$app/common/colors';
import { useBlockLibrary } from '../block-library';
import { BlockDefinition } from '../types';

interface ComponentLibraryProps {
  onDragStart?: (definition: BlockDefinition) => void;
  onDragEnd?: () => void;
}

export function ComponentLibrary({
  onDragStart,
  onDragEnd,
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
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
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
  onDragStart?: (definition: BlockDefinition) => void;
  onDragEnd?: () => void;
}

function BlockCard({
  definition,
  onDragStart: onDragStartProp,
  onDragEnd,
}: BlockCardProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'copy';
    // Exclude non-serializable icon (ReactNode) from drag data
    const { icon: _, ...serializableDefinition } = definition;
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify(serializableDefinition)
    );
    onDragStartProp?.(definition);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="w-full rounded-md border shadow-sm flex items-start gap-3 py-3 px-3 cursor-move select-none transition-colors hover:bg-gray-50"
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$24,
        color: colors.$3,
      }}
      title={String(t('drag_and_drop_to_add'))}
    >
      <div className="mt-0.5 flex-shrink-0">{definition.icon}</div>

      <div className="flex-1 min-w-0">
        <div
          className="font-medium text-sm mb-0.5 flex items-center gap-2"
          style={{ color: colors.$3 }}
        >
          {definition.label}
          {definition.essential && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-normal">
              {t('essential')}
            </span>
          )}
        </div>
        {definition.description && (
          <div
            className="text-xs line-clamp-2"
            style={{ color: colors.$17 }}
          >
            {definition.description}
          </div>
        )}
      </div>

      <div
        className="opacity-60 flex-shrink-0 mt-0.5"
        title={String(t('drag_and_drop_to_add'))}
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
}
