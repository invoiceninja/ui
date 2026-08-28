/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { ErrorBanner } from './ErrorBanner';
import { StepFooter } from './StepFooter';
import { Legend } from './Legend';
import { StepTransition } from './StepTransition';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

export function StepNotes({ wizard, embedded }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  const invoice = wizard.invoice;

  return (
    <StepTransition>
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

      <div>
        <Legend>{t('terms')}</Legend>

        <p className="text-xs -mt-1 mb-1" style={{ color: colors.$17 }}>
          {t('terms_printed_on_invoice')}
        </p>

        <MarkdownEditor
          value={invoice?.terms ?? ''}
          onChange={(value) => wizard.patch({ terms: value })}
        />

        <div className="mt-4 flex items-center space-x-2">
          <Toggle
            checked={wizard.saveDefaultTerms}
            onValueChange={(value) => wizard.setSaveDefaultTerms(value)}
          />

          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('save_as_default_terms')}
          </span>
        </div>
      </div>

      {embedded ? null : (
        <>
          <StepFooter
            back={
              <Button
                type="secondary"
                behavior="button"
                disableWithoutIcon
                onClick={wizard.back}
              >
                {t('back')}
              </Button>
            }
          >
            <Button
              behavior="button"
              disableWithoutIcon
              onClick={() => {
                void wizard.flush();
                wizard.next();
              }}
            >
              {t('review_and_send')}
            </Button>
          </StepFooter>
        </>
      )}
    </StepTransition>
  );
}
