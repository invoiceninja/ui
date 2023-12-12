/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Button } from '$app/components/forms/Button';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Element } from '$app/components/cards';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { useConfigureGroupSettings } from '../../group-settings/common/hooks/useConfigureGroupSettings';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useConfigureClientSettings } from '$app/pages/clients/common/hooks/useConfigureClientSettings';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  isSettingsPage?: boolean;
}
export function DeleteLogo({ isSettingsPage = true }: Props) {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const {
    isGroupSettingsActive,
    isCompanySettingsActive,
    isClientSettingsActive,
  } = useCurrentSettingsLevel();

  const activeSettings = useAtomValue(activeSettingsAtom);

  const configureGroupSettings = useConfigureGroupSettings({
    withoutNavigation: true,
  });

  const configureClientSettings = useConfigureClientSettings({
    withoutNavigation: true,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: companyChanges,
    onSubmit: () => {
      toast.processing();

      let endpointRoute = '/api/v1/companies/:id';

      let entityId = company.id;

      if (activeSettings) {
        if (isGroupSettingsActive) {
          endpointRoute = '/api/v1/group_settings/:id';
          entityId = activeSettings.id;
        }

        if (isClientSettingsActive) {
          endpointRoute = '/api/v1/clients/:id';
          entityId = activeSettings.id;
        }
      }

      request(
        'PUT',
        endpoint(endpointRoute, { id: entityId }),
        formik.values
      ).then((response: AxiosResponse) => {
        if (isCompanySettingsActive) {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );
        }

        if (isGroupSettingsActive) {
          $refetch(['group_settings']);
          configureGroupSettings(response.data.data);
        }

        if (isClientSettingsActive) {
          $refetch(['clients']);
          configureClientSettings(response.data.data);
        }

        toast.success('removed_logo');
      });
    },
  });

  const deleteLogo = () => {
    formik.setFieldValue('settings.company_logo', '');
    formik.submitForm();
  };

  return isSettingsPage ? (
    <Element>
      <Button behavior="button" type="minimal" onClick={() => deleteLogo()}>
        {t('remove_logo')}
      </Button>
    </Element>
  ) : (
    <Button behavior="button" type="minimal" onClick={() => deleteLogo()}>
      {t('remove_logo')}
    </Button>
  );
}
