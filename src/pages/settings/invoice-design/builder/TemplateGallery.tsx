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
import { PlusCircle, Sparkles, FileText, Minimize2, Palette } from 'lucide-react';
import { Button } from '$app/components/forms';
import { Card } from '$app/components/cards';
import { templates } from './templates/templates';
import { route } from '$app/common/helpers/route';

type CategoryFilter = 'all' | 'modern' | 'classic' | 'minimal' | 'creative';

export function TemplateGallery() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const categoryConfig = [
    { id: 'all' as const, label: t('all'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'modern' as const, label: 'Modern', icon: <Palette className="w-4 h-4" /> },
    { id: 'minimal' as const, label: 'Minimal', icon: <Minimize2 className="w-4 h-4" /> },
    { id: 'classic' as const, label: 'Classic', icon: <FileText className="w-4 h-4" /> },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates.filter(t => t.id !== 'blank')
    : templates.filter(t => t.category === selectedCategory);

  const blankTemplate = templates.find(t => t.id === 'blank');

  const handleSelectTemplate = (templateId: string) => {
    navigate(route('/settings/invoice_design/builder/new?template=:id', { id: templateId }));
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('create_your_perfect_invoice_design')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('choose_a_professional_template_and_customize_it_to_match_your_brand')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          {categoryConfig.map((category) => (
            <Button
              key={category.id}
              type="secondary"
              behavior="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`
                ${selectedCategory === category.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {category.icon}
                {category.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-200 group overflow-hidden border-2 hover:border-blue-500 bg-white rounded-lg"
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Template Preview Placeholder */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-24 h-24 text-gray-400 group-hover:text-gray-500 transition-colors" />
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    {t('use_this_template')}
                  </Button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          ))}

          {/* Blank Canvas Option */}
          {blankTemplate && (
            <div
              className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-500 group bg-white rounded-lg"
              onClick={() => handleSelectTemplate('blank')}
            >
              <div className="aspect-[3/4] flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors">
                <div className="text-center px-6">
                  <PlusCircle className="w-20 h-20 mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <h3 className="font-semibold text-xl mb-2 text-gray-900">
                    {blankTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {blankTemplate.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {t('no_templates_found_in_this_category')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateGallery;
