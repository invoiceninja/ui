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
import { useShowGuidedInvoiceEditor } from '$app/common/hooks/useInvoiceEditor';
import {
  useFlushReactSettings,
  useUpdateReactSettings,
} from '$app/common/hooks/useReactSettings';
import Toggle from '$app/components/forms/Toggle';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const persist = debounce((flush: () => Promise<unknown>) => void flush(), 300);

interface Props {
  counterpart: string;
}

export function AdvancedConfigurationToggle({ counterpart }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();

  const detailed = !useShowGuidedInvoiceEditor();
  const updateSettings = useUpdateReactSettings();
  const flushSettings = useFlushReactSettings();

  return (
    <div className="flex items-center justify-end space-x-2">
      <span className="text-sm whitespace-nowrap" style={{ color: colors.$3 }}>
        {t('advance_configuration')}
      </span>

      <Toggle
        checked={detailed}
        onValueChange={(value) => {
          updateSettings('show_advanced_invoice_editor', value);
          persist(flushSettings);
          navigate(counterpart);
        }}
      />
    </div>
  );
}
