/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { cloneDeep, isEqual, set } from 'lodash';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { useColorScheme } from '$app/common/colors';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import {
  injectInChanges,
  updateChanges,
} from '$app/common/stores/slices/company-users';
import { CustomFields, useCustomField } from '$app/components/CustomField';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { ChevronLeft } from '$app/components/icons/ChevronLeft';
import { Cube } from '$app/components/icons/Cube';
import { Invoice } from '$app/components/icons/Invoice';
import { OppositeArrows } from '$app/components/icons/OppositeArrows';
import { Modal } from '$app/components/Modal';
import { SortableVariableList } from '$app/pages/settings/invoice-design/pages/general-settings/components/SortableVariableList';
import { isCompanySettingsFormBusy } from '../../common/hooks/useHandleCompanySave';

interface Props {
  fields: string[];
  onSave: () => Promise<unknown>;
  onClose: () => void;
}

interface Entry {
  field: CustomFields;
  variable: string;
  fallback: string;
}

interface CaptionProps {
  icon: ReactNode;
  label: string;
}

function Caption(props: CaptionProps) {
  const colors = useColorScheme();

  return (
    <div className="flex items-center space-x-2 px-5 sm:px-6 pb-2">
      <div className="flex items-center">{props.icon}</div>

      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: colors.$22 }}
      >
        {props.label}
      </span>
    </div>
  );
}

export function AddFieldsToDesignModal(props: Props) {
  const [t] = useTranslation();

  const { fields } = props;

  const colors = useColorScheme();
  const dispatch = useDispatch();

  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();
  const customField = useCustomField();

  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });

  const [step, setStep] = useState<'fields' | 'sort'>('fields');

  const isFinished = useRef<boolean>(false);
  const isSaving = useRef<boolean>(false);
  const snapshot = useRef<Record<string, string[]> | null>(null);

  const invoiceVariables = [
    { value: '$invoice.number', label: t('invoice_number') },
    { value: '$invoice.po_number', label: t('po_number') },
    { value: '$invoice.date', label: t('invoice_date') },
    { value: '$invoice.due_date', label: t('invoice_due_date') },
    { value: '$invoice.amount', label: t('invoice_amount') },
    { value: '$invoice.balance', label: t('invoice_balance') },
    { value: '$invoice.balance_due', label: t('balance_due') },
    {
      value: '$invoice.custom1',
      label: customField('invoice1').label() || t('custom1'),
    },
    {
      value: '$invoice.custom2',
      label: customField('invoice2').label() || t('custom2'),
    },
    {
      value: '$invoice.custom3',
      label: customField('invoice3').label() || t('custom3'),
    },
    {
      value: '$invoice.custom4',
      label: customField('invoice4').label() || t('custom4'),
    },
    { value: '$invoice.project', label: t('project') },
    { value: '$client.balance', label: t('client_balance') },
    { value: '$invoice.total', label: t('invoice_total') },
  ];

  const productVariables = [
    { value: '$product.item', label: t('item') },
    { value: '$product.description', label: t('description') },
    { value: '$product.quantity', label: t('quantity') },
    { value: '$product.unit_cost', label: t('unit_cost') },
    { value: '$product.net_cost', label: t('unit_cost') },
    { value: '$product.tax', label: t('tax') },
    { value: '$product.discount', label: t('discount') },
    { value: '$product.line_total', label: t('line_total') },
    {
      value: '$product.product1',
      label: customField('product1').label() || t('custom1'),
    },
    {
      value: '$product.product2',
      label: customField('product2').label() || t('custom2'),
    },
    {
      value: '$product.product3',
      label: customField('product3').label() || t('custom3'),
    },
    {
      value: '$product.product4',
      label: customField('product4').label() || t('custom4'),
    },
    { value: '$product.gross_line_total', label: t('gross_line_total') },
    { value: '$product.tax_amount', label: t('tax_amount') },
  ];

  const invoiceEntries: Entry[] = [
    { field: 'invoice1', variable: '$invoice.custom1', fallback: 'custom1' },
    { field: 'invoice2', variable: '$invoice.custom2', fallback: 'custom2' },
    { field: 'invoice3', variable: '$invoice.custom3', fallback: 'custom3' },
    { field: 'invoice4', variable: '$invoice.custom4', fallback: 'custom4' },
  ];

  const productEntries: Entry[] = [
    { field: 'product1', variable: '$product.product1', fallback: 'custom1' },
    { field: 'product2', variable: '$product.product2', fallback: 'custom2' },
    { field: 'product3', variable: '$product.product3', fallback: 'custom3' },
    { field: 'product4', variable: '$product.product4', fallback: 'custom4' },
  ];

  const resolveEntries = (entries: Entry[]) => {
    return entries
      .filter((entry) => fields.includes(entry.field))
      .map((entry) => ({
        variable: entry.variable,
        label: customField(entry.field).label() || t(entry.fallback),
      }));
  };

  const groups = [
    {
      target: 'invoice_details',
      caption: t('invoice_details'),
      icon: <Invoice size="1.1rem" color="#2176FF" />,
      dragHelp: t('invoice_fields_help'),
      defaultVariables: invoiceVariables,
      excludedVariables: [],
      entries: resolveEntries(invoiceEntries),
    },
    {
      target: 'product_columns',
      caption: company?.settings?.sync_invoice_quote_columns
        ? t('product_columns')
        : t('invoice_product_columns'),
      icon: <Cube size="1.1rem" color="#2176FF" />,
      dragHelp: t('product_fields_help'),
      defaultVariables: productVariables,
      excludedVariables: company?.enabled_item_tax_rates
        ? []
        : ['$product.tax_amount', '$product.tax'],
      entries: resolveEntries(productEntries),
    },
  ].filter((group) => group.entries.length > 0);

  const renderedGroups = useRef<typeof groups>([]);

  if (groups.length) {
    renderedGroups.current = groups;
  }

  const isChecked = (target: string, variable: string) => {
    return Boolean(
      companyChanges?.settings?.pdf_variables?.[target]?.includes(variable)
    );
  };

  const sortGroups = renderedGroups.current.filter((group) =>
    group.entries.some((entry) => isChecked(group.target, entry.variable))
  );

  const renderedSortGroups = useRef<typeof groups>([]);

  if (step === 'fields' && sortGroups.length) {
    renderedSortGroups.current = sortGroups;
  }

  const isSideBySide =
    step === 'sort' && isLargeScreen && renderedSortGroups.current.length > 1;

  const handleToggle = (target: string, variable: string, value: boolean) => {
    const companyClone = cloneDeep(companyChanges);

    const variables: string[] =
      companyClone?.settings?.pdf_variables?.[target] ?? [];

    set(
      companyClone,
      `settings.pdf_variables.${target}`,
      value
        ? [...variables, variable]
        : variables.filter((current) => current !== variable)
    );

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const handleClose = () => {
    isFinished.current = true;

    snapshot.current &&
      dispatch(
        updateChanges({
          object: 'company',
          property: 'settings.pdf_variables',
          value: snapshot.current,
        })
      );

    props.onClose();
  };

  const handleSave = () => {
    isFinished.current = true;

    if (
      isEqual(
        company?.settings?.pdf_variables,
        companyChanges?.settings?.pdf_variables
      )
    ) {
      handleClose();

      return;
    }

    isSaving.current = true;

    return props.onSave();
  };

  useEffect(() => {
    if (fields.length) {
      isFinished.current = false;
      isSaving.current = false;
      snapshot.current = null;

      setStep('fields');
    }
  }, [fields]);

  useEffect(() => {
    if (
      !fields.length ||
      !company ||
      isFinished.current ||
      companyChanges !== company
    ) {
      return;
    }

    const companyClone = cloneDeep(company);

    if (!companyClone.settings.pdf_variables) {
      set(companyClone, 'settings.pdf_variables', {});
    }

    snapshot.current = cloneDeep(companyClone.settings.pdf_variables);

    groups.forEach((group) => {
      const variables: string[] =
        companyClone.settings.pdf_variables[group.target] ?? [];

      const additions = group.entries
        .map((entry) => entry.variable)
        .filter((variable) => !variables.includes(variable));

      set(companyClone, `settings.pdf_variables.${group.target}`, [
        ...variables,
        ...additions,
      ]);
    });

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  }, [fields, company, companyChanges]);

  useEffect(() => {
    if (!isSaving.current) {
      return;
    }

    isSaving.current = false;

    props.onClose();
  }, [company]);

  return (
    <Modal
      title={t('invoice_design')}
      visible={Boolean(fields.length)}
      onClose={handleClose}
      size={isSideBySide ? 'large' : 'regular'}
      disableClosing={isFormBusy}
      overflowVisible
      withoutHorizontalPadding
      withoutVerticalMargin
    >
      <div className="flex flex-col pt-5 sm:pt-6">
        {step === 'fields' ? (
          renderedGroups.current.map((group, index) => (
            <div key={index} className="flex flex-col">
              {Boolean(index) && (
                <div className="px-5 sm:px-6 py-4">
                  <Divider
                    className="border-dashed"
                    borderColor={colors.$20}
                    withoutPadding
                  />
                </div>
              )}

              <Caption icon={group.icon} label={group.caption} />

              {group.entries.map((entry, entryIndex) => (
                <Element
                  key={entryIndex}
                  leftSide={
                    <span style={{ color: colors.$3 }}>{entry.label}</span>
                  }
                  twoGridColumns
                  pushContentToRight
                >
                  <Toggle
                    checked={isChecked(group.target, entry.variable)}
                    onValueChange={(value) =>
                      handleToggle(group.target, entry.variable, value)
                    }
                    disabled={isFormBusy}
                  />
                </Element>
              ))}
            </div>
          ))
        ) : (
          <div
            className={classNames('grid grid-cols-1 gap-y-6', {
              'lg:grid-cols-2 lg:gap-y-0': isSideBySide,
            })}
          >
            {renderedSortGroups.current.map((group, index) => (
              <div key={index} className="flex flex-col">
                <Caption icon={group.icon} label={group.caption} />

                <div className="px-5 sm:px-6 pb-1">
                  <span className="text-xs" style={{ color: colors.$22 }}>
                    {group.dragHelp}
                  </span>
                </div>

                <SortableVariableList
                  for={group.target}
                  defaultVariables={group.defaultVariables}
                  excludedVariables={group.excludedVariables}
                  disabled={isFormBusy}
                  withDragPortal
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-5 sm:px-6 pt-4">
          {step === 'fields' ? (
            <Button
              behavior="button"
              type="secondary"
              onClick={() => setStep('sort')}
              disabled={isFormBusy || !sortGroups.length}
              disableWithoutIcon
            >
              <OppositeArrows size="1.1rem" color={colors.$3} />

              <span>{t('sort')}</span>
            </Button>
          ) : (
            <Button
              behavior="button"
              type="secondary"
              onClick={() => setStep('fields')}
              disabled={isFormBusy}
              disableWithoutIcon
            >
              <ChevronLeft size="1.1rem" color={colors.$3} />

              <span>{t('back')}</span>
            </Button>
          )}

          <div className="flex items-center space-x-4">
            <Button
              behavior="button"
              type="secondary"
              onClick={handleClose}
              disabled={isFormBusy}
              disableWithoutIcon
            >
              {t('cancel')}
            </Button>

            <Button
              behavior="button"
              onClick={handleSave}
              disabled={isFormBusy}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
