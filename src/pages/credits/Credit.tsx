/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Credit as ICredit } from '$app/common/interfaces/credit';
import { useCreditQuery } from './common/queries';
import { creditAtom } from './common/atoms';
import { useActions, useCreditUtilities, useSave } from './common/hooks';
import { Tabs } from '$app/components/Tabs';
import { useTabs } from './common/hooks/useTabs';

export default function Credit() {
  const { documentTitle } = useTitle('edit_credit');
  const [t] = useTranslation();

  const { id } = useParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const pages: Page[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('edit_credit'),
      href: route('/credits/:id/edit', { id }),
    },
  ];

  const { data } = useCreditQuery({ id: id! });

  const [credit, setQuote] = useAtom(creditAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const actions = useActions();
  const tabs = useTabs({ credit });

  const { calculateInvoiceSum } = useCreditUtilities({ client });

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  const save = useSave({ setErrors, isDefaultFooter, isDefaultTerms });

  useEffect(() => {
    if (data) {
      const _credit = cloneDeep(data);

      _credit.line_items.map((item) => (item._id = v4()));

      setQuote(_credit);

      if (_credit && _credit.client) {
        setClient(_credit.client);
      }
    }
  }, [data]);

  useEffect(() => {
    credit && calculateInvoiceSum(credit);
  }, [credit]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_credit') || entityAssigned(credit)) &&
        credit && {
          navigationTopRight: (
            <ResourceActions
              resource={credit}
              onSaveClick={() => save(credit)}
              actions={actions}
              cypressRef="creditActionDropdown"
            />
          ),
        })}
    >
      {credit?.id === id ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              credit,
              errors,
              isDefaultTerms,
              setIsDefaultTerms,
              isDefaultFooter,
              setIsDefaultFooter,
              client,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      <ChangeTemplateModal<ICredit>
        entity="credit"
        entities={changeTemplateResources as ICredit[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(credit) => `${t('number')}: ${credit.number}`}
        bulkUrl="/api/v1/credits/bulk"
      />
    </Default>
  );
}
