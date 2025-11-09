import { useEnabled } from '$app/common/guards/guards/enabled';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useTranslation } from 'react-i18next';
import { NavigationItem } from '../components/DesktopSidebar';
import { House } from '$app/components/icons/House';
import { Users } from '$app/components/icons/Users';
import { Cube } from '$app/components/icons/Cube';
import { Plus } from '$app/components/icons/Plus';
import { Invoice as InvoiceIcon } from '../../icons/Invoice';
import { ModuleBitmask } from '$app/pages/settings';
import { Refresh } from '$app/components/icons/Refresh';
import { CreditCard } from '$app/components/icons/CreditCard';
import { Files } from '$app/components/icons/Files';
import { Wallet } from '$app/components/icons/Wallet';
import { SuitCase } from '$app/components/icons/SuitCase';
import { ClipboardCheck } from '$app/components/icons/ClipboardCheck';
import { Office } from '$app/components/icons/Office';
import { FileClock } from '$app/components/icons/FileClock';
import SackCoins from '$app/components/icons/SackCoins';
import { CurrencyExchange } from '$app/components/icons/CurrencyExchange';
import { ArrowsTransaction } from '$app/components/icons/ArrowsTransaction';
import { ChartLine } from '$app/components/icons/ChartLine';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { Gear } from '$app/components/icons/Gear';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { File } from 'react-feather';
import collect from 'collect.js';
import { useEffect } from 'react';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';

const $cache = atom<NavigationItem[] | null>(null);

export function useNavigation() {
  const [t] = useTranslation();
  const enabled = useEnabled();
  const hasPermission = useHasPermission();
  const docuCompanyAccountDetails = useAtomValue(docuNinjaAtom);
  const companyUser = useCurrentCompanyUser();
  const company = useCurrentCompany();

  const [cache, setCache] = useAtom($cache);

  const initialNavigation: NavigationItem[] = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: House,
      visible: hasPermission('view_dashboard'),
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      visible:
        hasPermission('view_client') ||
        hasPermission('create_client') ||
        hasPermission('edit_client'),
      rightButton: {
        icon: Plus,
        to: '/clients/create',
        label: t('new_client'),
        visible: hasPermission('create_client'),
      },
    },
    {
      name: t('products'),
      href: '/products',
      icon: Cube,
      visible:
        hasPermission('view_product') ||
        hasPermission('create_product') ||
        hasPermission('edit_product'),
      rightButton: {
        icon: Plus,
        to: '/products/create',
        label: t('new_product'),
        visible: hasPermission('create_product'),
      },
    },
    {
      name: t('invoices'),
      href: '/invoices',
      icon: InvoiceIcon,
      visible:
        enabled(ModuleBitmask.Invoices) &&
        (hasPermission('view_invoice') ||
          hasPermission('create_invoice') ||
          hasPermission('edit_invoice')),
      rightButton: {
        icon: Plus,
        to: '/invoices/create',
        label: t('new_invoice'),
        visible: hasPermission('create_invoice'),
      },
    },
    {
      name: t('recurring_invoices'),
      href: '/recurring_invoices',
      icon: Refresh,
      visible:
        enabled(ModuleBitmask.RecurringInvoices) &&
        (hasPermission('view_recurring_invoice') ||
          hasPermission('create_recurring_invoice') ||
          hasPermission('edit_recurring_invoice')),
      rightButton: {
        icon: Plus,
        to: '/recurring_invoices/create',
        label: t('new_recurring_invoice'),
        visible: hasPermission('create_recurring_invoice'),
      },
    },
    {
      name: t('payments'),
      href: '/payments',
      icon: CreditCard,
      visible:
        hasPermission('view_payment') ||
        hasPermission('create_payment') ||
        hasPermission('edit_payment'),
      rightButton: {
        icon: Plus,
        to: '/payments/create',
        label: t('new_payment'),
        visible: hasPermission('create_payment'),
      },
    },
    {
      name: t('quotes'),
      href: '/quotes',
      icon: Files,
      visible:
        enabled(ModuleBitmask.Quotes) &&
        (hasPermission('view_quote') ||
          hasPermission('create_quote') ||
          hasPermission('edit_quote')),
      rightButton: {
        icon: Plus,
        to: '/quotes/create',
        label: t('new_quote'),
        visible: hasPermission('create_quote'),
      },
    },
    {
      name: t('credits'),
      href: '/credits',
      icon: Wallet,
      visible:
        enabled(ModuleBitmask.Credits) &&
        (hasPermission('view_credit') ||
          hasPermission('create_credit') ||
          hasPermission('edit_credit')),
      rightButton: {
        icon: Plus,
        to: '/credits/create',
        label: t('new_credit'),
        visible: hasPermission('create_credit'),
      },
    },
    {
      name: t('projects'),
      href: '/projects',
      icon: SuitCase,
      visible:
        enabled(ModuleBitmask.Projects) &&
        (hasPermission('view_project') ||
          hasPermission('create_project') ||
          hasPermission('edit_project')),
      rightButton: {
        icon: Plus,
        to: '/projects/create',
        label: t('new_project'),
        visible: hasPermission('create_project'),
      },
    },
    {
      name: t('tasks'),
      href: '/tasks',
      icon: ClipboardCheck,
      visible:
        enabled(ModuleBitmask.Tasks) &&
        (hasPermission('view_task') ||
          hasPermission('edit_task') ||
          hasPermission('create_task')),
      rightButton: {
        icon: Plus,
        to: '/tasks/create',
        label: t('new_task'),
        visible: hasPermission('create_task'),
      },
    },
    {
      name: t('vendors'),
      href: '/vendors',
      icon: Office,
      visible:
        enabled(ModuleBitmask.Vendors) &&
        (hasPermission('view_vendor') ||
          hasPermission('create_vendor') ||
          hasPermission('edit_vendor')),
      rightButton: {
        icon: Plus,
        to: '/vendors/create',
        label: t('new_vendor'),
        visible: hasPermission('create_vendor'),
      },
    },
    {
      name: t('purchase_orders'),
      href: '/purchase_orders',
      icon: FileClock,
      visible:
        enabled(ModuleBitmask.PurchaseOrders) &&
        (hasPermission('view_purchase_order') ||
          hasPermission('create_purchase_order') ||
          hasPermission('edit_purchase_order')),
      rightButton: {
        icon: Plus,
        to: '/purchase_orders/create',
        label: t('new_purchase_order'),
        visible: hasPermission('create_purchase_order'),
      },
    },
    {
      name: t('expenses'),
      href: '/expenses',
      icon: SackCoins,
      visible:
        enabled(ModuleBitmask.Expenses) &&
        (hasPermission('view_expense') ||
          hasPermission('create_expense') ||
          hasPermission('edit_expense')),
      rightButton: {
        icon: Plus,
        to: '/expenses/create',
        label: t('new_expense'),
        visible: hasPermission('create_expense'),
      },
    },
    {
      name: t('recurring_expenses'),
      href: '/recurring_expenses',
      icon: CurrencyExchange,
      visible:
        enabled(ModuleBitmask.RecurringExpenses) &&
        (hasPermission('view_recurring_expense') ||
          hasPermission('create_recurring_expense') ||
          hasPermission('edit_recurring_expense')),
      rightButton: {
        icon: Plus,
        to: '/recurring_expenses/create',
        label: t('new_recurring_expense'),
        visible: hasPermission('create_recurring_expense'),
      },
    },
    {
      name: t('transactions'),
      href: '/transactions',
      icon: ArrowsTransaction,
      visible:
        enabled(ModuleBitmask.Transactions) &&
        (hasPermission('view_bank_transaction') ||
          hasPermission('create_bank_transaction') ||
          hasPermission('edit_bank_transaction')),
      rightButton: {
        icon: Plus,
        to: '/transactions/create',
        label: t('new_transaction'),
        visible: hasPermission('create_bank_transaction'),
      },
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: ChartLine,
      visible: hasPermission('view_reports'),
    },
    {
      name: t('docuninja'),
      href: '/documents',
      icon: ArrowsTransaction,
      rightButton: {
        icon: Plus,
        to: '/documents/create',
        label: t('new_document'),
        visible: true,
      },
      visible: true,
      subOptions: [
        {
          name: t('templates'),
          href: '/documents/templates',
          icon: File,
          visible: true,
          rightButton: {
            icon: Plus,
            to: '/documents/templates/create',
            label: t('new_template'),
            visible: true,
          },
        },
        {
          name: t('users'),
          href: '/documents/users',
          icon: Users,
          visible: true,
          rightButton: {
            icon: Plus,
            to: '/documents/users/create',
            label: t('new_user'),
            visible:
              (docuCompanyAccountDetails?.account?.num_users || 0) !==
              (docuCompanyAccountDetails?.account?.users || [])?.length,
          },
        },
      ],
    },
    {
      name: t('settings'),
      href:
        companyUser?.is_admin || companyUser?.is_owner
          ? '/settings/company_details'
          : '/settings/user_details',
      icon: Gear,
      visible: Boolean(company),
    },
  ];

  useEffect(() => {
    if (cache === null) {
      setCache(initialNavigation);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('navigation.changeVisibility', (event) => {
      const { href, visible } = (event as CustomEvent).detail as {
        href: string;
        visible: boolean;
      };

      setCache((current) => {
        if (!current) {
          return initialNavigation;
        }

        const collection = collect(current);

        const updated = collection.map((item) => {
          if (item.href === href) {
            item.visible = visible;
          }

          if (item.subOptions) {
            item.subOptions = item.subOptions.map((sub) => {
              if (sub.href === href) {
                sub.visible = visible;
              }

              return sub;
            });
          }

          return item;
        });

        return updated.all() as NavigationItem[];
      });
    });
  }, []);

  return cache ?? initialNavigation;
}

export interface NavigationHandler {
  href: string;
}

export function $visibility(href: string, visible: boolean) {
  window.dispatchEvent(
    new CustomEvent('navigation.changeVisibility', {
      detail: {
        href,
        visible,
      },
    })
  );
}
