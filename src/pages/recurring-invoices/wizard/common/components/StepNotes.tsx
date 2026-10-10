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
import { useTranslation } from 'react-i18next';
import { StepFooter } from './StepFooter';
import { StepTransition } from './StepTransition';
import { Wizard } from '../hooks/useWizard';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

export function StepNotes({ wizard, embedded }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  const recurringInvoice = wizard.recurringInvoice;

  return (
    <StepTransition>
      <div>
        <p className="text-sm mb-3 leading-6" style={{ color: colors.$17 }}>
          {t('default_terms_help')}
        </p>

        <MarkdownEditor
          value={recurringInvoice?.terms ?? ''}
          onChange={(value) => wizard.patch({ terms: value })}
        />
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
            <Button behavior="button" disableWithoutIcon onClick={wizard.next}>
              {t('review_and_start')}
            </Button>
          </StepFooter>
        </>
      )}
    </StepTransition>
  );
}
