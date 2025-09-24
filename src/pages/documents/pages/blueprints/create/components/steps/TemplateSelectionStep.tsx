/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Button } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { docuNinjaEndpoint } from '$app/common/helpers';

interface TemplateSelectionStepProps {
  onComplete: (blueprintId: string) => void;
  onBack: () => void;
}

// Mock data - replace with actual API call
const TEMPLATE_CATEGORIES = [
  { id: 'business', name: 'Business', icon: '🏢' },
//   { id: 'creative', name: 'Creative', icon: '🎨' },
//   { id: 'minimal', name: 'Minimal', icon: '⚪' },
//   { id: 'modern', name: 'Modern', icon: '✨' },
];

const TEMPLATES = [
  {
    id: 'nda-template',
    name: 'NDA',
    category: 'business',
    description: 'Non-Disclosure Agreement',
    preview: '📄',
  },
  {
    id: 'blank',
    name: 'Blank Template',
    category: 'business',
    description: 'Start from scratch!',
    preview: '🎨',
  },
//   {
//     id: 'template-3',
//     name: 'Minimal Credit',
//     category: 'minimal',
//     description: 'Simple and clean credit note template',
//     preview: '⚪',
//   },
//   {
//     id: 'template-4',
//     name: 'Modern Purchase Order',
//     category: 'modern',
//     description: 'Contemporary purchase order design',
//     preview: '✨',
//   },
];

export function TemplateSelectionStep({ onComplete, onBack }: TemplateSelectionStepProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('business');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredTemplates = TEMPLATES.filter(
    (template) => template.category === selectedCategory
  );

  const handleCreateBlueprint = async () => {
    if (!selectedTemplate || isLoading) return;

    setIsLoading(true);
    toast.processing();

    try {
      const response = await request(
        'GET',
        docuNinjaEndpoint('/api/galleries/:id', { id: selectedTemplate }),{},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ) as any;

      const templateHtml = response.data.html;
      const templateName = response.data.name;

      console.log('Template HTML loaded successfully');

      toast.success('template_loaded');
      
      // Navigate to GrapeJS editor with the template HTML
      console.log('Navigating to editor...');
      navigate(route('/documents/blueprints/create/template_editor'), {
        state: { templateHtml, templateName }
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('error_loading_template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('select_from_template')}</h2>
        <p className="text-gray-600">{t('choose_template_description')}</p>
      </div>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-1/4">
          <Element>
            <h3 className="font-semibold mb-4">{t('categories')}</h3>
            <div className="space-y-2">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedTemplate('');
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id 
                      ? colors.$3 + '10' 
                      : 'transparent',
                    color: selectedCategory === category.id 
                      ? colors.$3 
                      : 'inherit',
                  }}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </Element>
        </div>

        {/* Templates Grid */}
        <div className="flex-1">
          <Element>
            <h3 className="font-semibold mb-4">
              {TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name} {t('templates')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: selectedTemplate === template.id 
                      ? colors.$3 
                      : colors.$20,
                    backgroundColor: selectedTemplate === template.id 
                      ? colors.$3 + '10' 
                      : 'transparent',
                  }}
                >
                  <div className="text-3xl mb-2">{template.preview}</div>
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </Element>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          onClick={handleCreateBlueprint}
          disabled={!selectedTemplate || isLoading}
        >
          {isLoading ? t('creating') : t('create_blueprint')}
        </Button>
      </div>
    </div>
  );
}
