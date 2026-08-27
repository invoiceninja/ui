/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { Braces, Check, FileCode2, PanelsTopLeft } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { Button } from '$app/components/forms';

type DesignType = 'legacy' | 'twig' | 'gui';

interface DesignTypeOption {
  id: DesignType;
  title: string;
  description: string;
  icon: ReactNode;
  recommended?: boolean;
}

export default function ChooseDesignType() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DesignType>('gui');

  const options: DesignTypeOption[] = [
    {
      id: 'legacy',
      title: t('legacy', { defaultValue: 'Legacy' }),
      description: t('legacy_design_description', {
        defaultValue:
          'Use the existing design editor and start from one of the classic invoice designs.',
      }),
      icon: <FileCode2 className="h-6 w-6" />,
    },
    {
      id: 'twig',
      title: t('twig_template', { defaultValue: 'Twig Template' }),
      description: t('twig_template_description', {
        defaultValue:
          'Build a reusable Twig template with direct control over markup, resources, and variables.',
      }),
      icon: <Braces className="h-6 w-6" />,
    },
    {
      id: 'gui',
      title: t('gui_designer', { defaultValue: 'GUI Designer' }),
      description: t('gui_designer_description', {
        defaultValue:
          'Choose a starting template, then customize the layout and content visually.',
      }),
      icon: <PanelsTopLeft className="h-6 w-6" />,
      recommended: true,
    },
  ];

  const handleNext = () => {
    if (selectedType === 'legacy') {
      navigate(route('/settings/invoice_design/custom_designs/create'));
      return;
    }

    if (selectedType === 'twig') {
      navigate(
        route('/settings/invoice_design/custom_designs/create?type=template')
      );
      return;
    }

    navigate(route('/settings/invoice_design/builder/templates'));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 py-4 space-y-8">
      <div>
        <h1 className="text-2xl font-medium" style={{ color: colors.$3 }}>
          {t('choose_design_type', {
            defaultValue: 'Choose how to create your design',
          })}
        </h1>
        <p className="text-sm mt-2" style={{ color: colors.$17 }}>
          {t('choose_design_type_description', {
            defaultValue:
              'Select the designer that best fits how you want to work.',
          })}
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        role="radiogroup"
        aria-label={t('choose_design_type', {
          defaultValue: 'Choose how to create your design',
        })}
      >
        {options.map((option) => {
          const isSelected = option.id === selectedType;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedType(option.id)}
              className={classNames(
                'relative min-h-56 rounded-lg border p-6 text-left transition-all duration-150',
                {
                  'shadow-md ring-1': isSelected,
                  'hover:shadow-sm': !isSelected,
                }
              )}
              style={{
                backgroundColor: colors.$1,
                borderColor: isSelected ? colors.$3 : colors.$24,
                boxShadow: isSelected
                  ? `0 0 0 1px ${colors.$3}`
                  : undefined,
              }}
              data-cy={`design-type-${option.id}`}
            >
              {option.recommended && (
                <span
                  className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs font-medium"
                  style={{ backgroundColor: colors.$25, color: colors.$3 }}
                >
                  {t('recommended', { defaultValue: 'Recommended' })}
                </span>
              )}

              <span
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-md"
                style={{ backgroundColor: colors.$25, color: colors.$3 }}
              >
                {option.icon}
              </span>

              <span className="flex items-center justify-between gap-3">
                <span
                  className="text-lg font-semibold"
                  style={{ color: colors.$3 }}
                >
                  {option.title}
                </span>

                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: isSelected ? colors.$3 : 'transparent',
                    borderColor: isSelected ? colors.$3 : colors.$24,
                    color: colors.$1,
                  }}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </span>
              </span>

              <span
                className="mt-3 block text-sm leading-6"
                style={{ color: colors.$17 }}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="secondary"
          behavior="button"
          onClick={() =>
            navigate(route('/settings/invoice_design/custom_designs'))
          }
        >
          {t('cancel')}
        </Button>
        <Button type="primary" behavior="button" onClick={handleNext}>
          {t('next')}
        </Button>
      </div>
    </div>
  );
}
