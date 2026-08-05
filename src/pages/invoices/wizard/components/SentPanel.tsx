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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../kit';
import { Wizard } from '../useWizard';

interface Props {
  wizard: Wizard;
}

export function SentPanel({ wizard }: Props) {
  const [translate] = useTranslation();
  const t = useTheme();
  const navigate = useNavigate();

  return (
    <div className="iw-enter">
      <p className="text-sm mb-6" style={{ color: t.muted }}>
        {wizard.sentTo
          ? `We emailed it to ${wizard.sentTo}.`
          : 'Your customer has been emailed.'}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          behavior="button"
          disableWithoutIcon
          onClick={() => navigate(`/invoices/${wizard.invoiceId}/edit`)}
        >
          {translate('view_invoice')}
        </Button>

        <Button
          type="secondary"
          behavior="button"
          disableWithoutIcon
          onClick={() => window.location.reload()}
        >
          {translate('new_invoice')}
        </Button>

        <Button
          type="secondary"
          behavior="button"
          disableWithoutIcon
          onClick={() => navigate('/invoices')}
        >
          {translate('invoices')}
        </Button>
      </div>
    </div>
  );
}
