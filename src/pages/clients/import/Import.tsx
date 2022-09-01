/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { UploadImport } from 'components/import/UploadImport';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

interface Props {
  entity: string;
}

export function Import(props: Props) {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('import');

  const pages: BreadcrumRecord[] = [
    { name: t(`${props.entity}s`), href: `/${props.entity}s` },
    { name: t('import'), href: `/${props.entity}s/import` },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages} onBackClick={`/${props.entity}s`}>
      <div className="grid grid-cols-12">
        <div className="col-span-12 xl:col-span-10">
          <UploadImport entity={props.entity} onSuccess={false} type="csv" />
        </div>
      </div>
    </Default>
  );
}
