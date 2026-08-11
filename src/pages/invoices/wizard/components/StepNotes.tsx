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
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useTranslation } from 'react-i18next';
import { ErrorBanner, Footer, Legend, useTheme } from '../kit';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
  embedded?: boolean;
}

export function StepNotes({ wizard, embedded }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();

  const invoice = wizard.invoice;

  return (
    <div className="iw-enter">
      {embedded ? null : <ErrorBanner errors={wizard.errors} />}

      <div className="space-y-6">
        <div>
          <Legend>{translate('public_notes')}</Legend>

          <p className="text-xs -mt-1 mb-1" style={{ color: t.muted }}>
            Shown on the invoice your customer receives.
          </p>

          <MarkdownEditor
            value={invoice?.public_notes ?? ''}
            onChange={(value) => wizard.patch({ public_notes: value })}
          />
        </div>

        <div>
          <Legend>{translate('terms')}</Legend>

          <p className="text-xs -mt-1 mb-1" style={{ color: t.muted }}>
            Payment terms and conditions printed on the invoice.
          </p>

          <MarkdownEditor
            value={invoice?.terms ?? ''}
            onChange={(value) => wizard.patch({ terms: value })}
          />
        </div>
      </div>

      {embedded ? null : (
        <>
          <p className="text-xs mt-6" style={{ color: t.muted }}>
            Both are optional. You can leave them empty and carry on.
          </p>

          <Footer
            back={
              <Button
                type="secondary"
                behavior="button"
                disableWithoutIcon
                onClick={wizard.back}
              >
                {translate('back')}
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
              Review and send
            </Button>
          </Footer>
        </>
      )}
    </div>
  );
}
