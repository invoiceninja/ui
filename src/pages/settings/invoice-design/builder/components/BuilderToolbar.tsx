/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Undo2, Redo2, Eye, Save, ArrowLeft, FileJson } from 'lucide-react';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface BuilderToolbarProps {
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
  onExportJSON: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  hasBlocks: boolean;
  zoom: number;
  designName?: string;
  isEditMode: boolean;
}

export function BuilderToolbar({
  onBack,
  onUndo,
  onRedo,
  onPreview,
  onSave,
  onExportJSON,
  canUndo,
  canRedo,
  isSaving,
  hasBlocks,
  zoom,
  designName,
  isEditMode,
}: BuilderToolbarProps) {
  const [t] = useTranslation();

  return (
    <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          type="secondary"
          behavior="button"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Button>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <Button
            type="secondary"
            behavior="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            type="secondary"
            behavior="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <span className="text-sm text-gray-600">
          {t('zoom')}: {zoom}%
        </span>

        {(isEditMode || designName) && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-sm font-medium text-gray-900">
              {designName || t('untitled')}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="secondary"
          behavior="button"
          onClick={onExportJSON}
          disabled={!hasBlocks}
          className="flex items-center gap-2"
        >
          <FileJson className="w-4 h-4" />
          {t('export_json')}
        </Button>

        <Button
          type="secondary"
          behavior="button"
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {t('preview')}
        </Button>

        <Button
          type="secondary"
          behavior="button"
          onClick={onSave}
          disabled={isSaving || !hasBlocks}
          disableWithoutIcon={!isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t('saving') : t('save_design')}
        </Button>
      </div>
    </div>
  );
}
