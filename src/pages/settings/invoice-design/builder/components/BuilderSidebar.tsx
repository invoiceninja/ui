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
import { Block, BlockDefinition } from '../types';
import { ComponentLibrary } from './ComponentLibrary';

interface BuilderSidebarProps {
  onAddBlock: (block: Block) => void;
  onDragStart: (definition: BlockDefinition) => void;
}

export function BuilderSidebar({
  onAddBlock,
  onDragStart,
}: BuilderSidebarProps) {
  const [t] = useTranslation();

  return (
    <div className="w-72 bg-white border-r flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg text-gray-900">
          {t('components')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('drag_and_drop_to_add')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ComponentLibrary onAddBlock={onAddBlock} onDragStart={onDragStart} />
      </div>
    </div>
  );
}
