/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Sparkles,
  Minimize2,
  Palette,
  FileText,
  Check,
} from 'lucide-react';
import { Button } from '$app/components/forms';
import { Card } from '$app/components/cards';
import { templates } from './templates/templates';
import { route } from '$app/common/helpers/route';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';
import { CSSProperties } from 'react';

type CategoryFilter = 'all' | 'modern' | 'classic' | 'minimal' | 'creative';

function TemplatePreview({
  templateId,
  colors,
}: {
  templateId: string;
  colors: ReturnType<typeof useColorScheme>;
}) {
  const previews: Record<string, JSX.Element> = {
    'modern-professional': (
      <div
        className="w-full h-full p-3 flex flex-col gap-2"
        style={{ backgroundColor: colors.$1 }}
      >
        <div className="flex justify-between items-start">
          <div
            className="w-12 h-3 rounded"
            style={{ backgroundColor: colors.$3 }}
          />
          <div
            className="w-16 h-2 rounded"
            style={{ backgroundColor: colors.$17 }}
          />
        </div>
        <div
          className="mt-2 w-20 h-4 rounded"
          style={{ backgroundColor: colors.$3 }}
        />
        <div
          className="mt-1 w-full h-px"
          style={{ backgroundColor: colors.$20 }}
        />
        <div className="flex gap-2 mt-1">
          <div className="flex-1 space-y-1">
            <div
              className="w-16 h-2 rounded"
              style={{ backgroundColor: colors.$3 }}
            />
            <div
              className="w-12 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
          <div className="space-y-1">
            <div
              className="w-14 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-10 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
        </div>
        <div className="mt-auto">
          <div
            className="w-full h-8 rounded flex items-center px-1 gap-1"
            style={{ backgroundColor: colors.$20 }}
          >
            <div
              className="flex-1 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-6 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-6 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
          <div className="mt-1 flex justify-end gap-1">
            <div
              className="w-8 h-1.5 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-8 h-1.5 rounded"
              style={{ backgroundColor: colors.$3 }}
            />
          </div>
        </div>
      </div>
    ),
    minimalist: (
      <div
        className="w-full h-full p-4 flex flex-col"
        style={{ backgroundColor: colors.$1 }}
      >
        <div className="flex justify-between items-start">
          <div
            className="w-14 h-2 rounded"
            style={{ backgroundColor: colors.$3 }}
          />
          <div
            className="w-12 h-1.5 rounded"
            style={{ backgroundColor: colors.$17 }}
          />
        </div>
        <div
          className="mt-3 w-full h-px"
          style={{ backgroundColor: colors.$3 }}
        />
        <div className="flex gap-4 mt-3">
          <div className="flex-1 space-y-0.5">
            <div
              className="w-12 h-1.5 rounded"
              style={{ backgroundColor: colors.$3 }}
            />
            <div
              className="w-10 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
          <div className="space-y-0.5">
            <div
              className="w-10 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-8 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
        </div>
        <div className="mt-auto space-y-1">
          <div
            className="w-full h-px"
            style={{ backgroundColor: colors.$20 }}
          />
          <div className="flex gap-1">
            <div
              className="flex-1 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-4 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
            <div
              className="w-4 h-1 rounded"
              style={{ backgroundColor: colors.$17 }}
            />
          </div>
          <div
            className="w-full h-px"
            style={{ backgroundColor: colors.$20 }}
          />
        </div>
      </div>
    ),
    blank: (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: colors.$20 }}
      >
        <Plus className="w-12 h-12" style={{ color: colors.$17 }} />
      </div>
    ),
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {previews[templateId] || (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: colors.$20 }}
        >
          <FileText className="w-12 h-12" style={{ color: colors.$17 }} />
        </div>
      )}
    </div>
  );
}

export function TemplateGallery() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categoryConfig = [
    {
      id: 'all' as const,
      label: t('all') || 'All',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'modern' as const,
      label: t('modern') || 'Modern',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'minimal' as const,
      label: t('minimal') || 'Minimal',
      icon: <Minimize2 className="w-4 h-4" />,
    },
    {
      id: 'classic' as const,
      label: t('classic') || 'Classic',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates.filter((t) => t.id !== 'blank')
      : templates.filter((t) => t.category === selectedCategory);

  const blankTemplate = templates.find((t) => t.id === 'blank');

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(
        route('/settings/invoice_design/builder/new?template=:id', {
          id: selectedTemplate,
        })
      );
    }
  };

  const getCardStyle = (isSelected: boolean): CSSProperties =>
    ({
      backgroundColor: colors.$1,
      border: `1px solid ${isSelected ? colors.$3 : colors.$24}`,
      '--tw-ring-color': isSelected ? colors.$3 : 'transparent',
    }) as CSSProperties;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.$3 }}>
            {t('choose_a_template')}
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.$17 }}>
            {t('select_starting_point_for_invoice_design')}
          </p>
        </div>
        {selectedTemplate && (
          <Button
            type="primary"
            behavior="button"
            onClick={handleContinue}
            className="flex items-center gap-2"
          >
            {t('continue')}
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <Card
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutHeaderBorder
        withoutBodyPadding
        padding="small"
      >
        <div className="flex gap-2 flex-wrap px-4 py-3 justify-center">
          {categoryConfig.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={classNames(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
                selectedCategory === category.id
                  ? 'shadow-sm'
                  : 'hover:shadow-sm'
              )}
              style={{
                backgroundColor:
                  selectedCategory === category.id ? colors.$3 : colors.$1,
                color: selectedCategory === category.id ? colors.$1 : colors.$3,
                border: `1px solid ${
                  selectedCategory === category.id ? colors.$3 : colors.$24
                }`,
              }}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={classNames(
                'group cursor-pointer rounded-xl overflow-hidden transition-all duration-200',
                isSelected ? 'ring-2 shadow-lg' : 'hover:shadow-md'
              )}
              style={getCardStyle(isSelected)}
            >
              {/* Template Preview */}
              <div
                className="aspect-[3/4] relative border-b"
                style={{ borderColor: colors.$20 }}
              >
                <TemplatePreview templateId={template.id} colors={colors} />
                {isSelected && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${colors.$3}10` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: colors.$3 }}
                    >
                      <Check className="w-6 h-6" style={{ color: colors.$1 }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-5">
                <h3
                  className="font-semibold text-lg"
                  style={{ color: colors.$3 }}
                >
                  {template.name}
                </h3>
                <p
                  className="text-sm mt-1 line-clamp-2"
                  style={{ color: colors.$17 }}
                >
                  {template.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* Blank Canvas Option */}
        {blankTemplate && (
          <div
            onClick={() => handleSelectTemplate('blank')}
            className={classNames(
              'group cursor-pointer rounded-xl overflow-hidden transition-all duration-200',
              selectedTemplate === 'blank'
                ? 'ring-2 shadow-lg'
                : 'hover:shadow-md'
            )}
            style={getCardStyle(selectedTemplate === 'blank')}
          >
            <div
              className="aspect-[3/4] relative border-b"
              style={{ borderColor: colors.$20 }}
            >
              <TemplatePreview templateId="blank" colors={colors} />
              {selectedTemplate === 'blank' && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: `${colors.$3}10` }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: colors.$3 }}
                  >
                    <Check className="w-6 h-6" style={{ color: colors.$1 }} />
                  </div>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3
                className="font-semibold text-lg"
                style={{ color: colors.$3 }}
              >
                {blankTemplate.name}
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.$17 }}>
                {blankTemplate.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State - only show if no templates AND no blank canvas */}
      {filteredTemplates.length === 0 && !blankTemplate && (
        <div className="text-center py-16">
          <FileText
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colors.$17 }}
          />
          <p style={{ color: colors.$17 }}>
            {t('no_templates_found_in_category')}
          </p>
        </div>
      )}
    </div>
  );
}

export default TemplateGallery;
