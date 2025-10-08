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
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { useAtomValue } from 'jotai';
import { useCurrentCompanyUser } from '$app/common/hooks/useCurrentCompanyUser';
import { Gear } from '$app/components/icons/Gear';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { File } from 'react-feather';
import collect from 'collect.js';
import { useEffect, useState } from 'react';

export function useNavigation() {
  const [t] = useTranslation();
  const enabled = useEnabled();
  const hasPermission = useHasPermission();
  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);
  const companyUser = useCurrentCompanyUser();
  const company = useCurrentCompany();

  const [navigation, setNavigation] = useState<NavigationItem[]>([
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: House,
      current: location.pathname.startsWith('/dashboard'),
      visible: hasPermission('view_dashboard'),
    },
    {
      name: t('clients'),
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients'),
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
      current: location.pathname.startsWith('/products'),
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
      current: location.pathname.startsWith('/invoices'),
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
      current: location.pathname.startsWith('/recurring_invoices'),
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
      current: location.pathname.startsWith('/payments'),
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
      current: location.pathname.startsWith('/quotes'),
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
      current: location.pathname.startsWith('/credits'),
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
      current: location.pathname.startsWith('/projects'),
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
      current: location.pathname.startsWith('/tasks'),
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
      current: location.pathname.startsWith('/vendors'),
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
      current: location.pathname.startsWith('/purchase_orders'),
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
      current: location.pathname.startsWith('/expenses'),
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
      current: location.pathname.startsWith('/recurring_expenses'),
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
      current: location.pathname.startsWith('/transactions'),
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
      current: location.pathname.startsWith('/reports'),
      visible: hasPermission('view_reports'),
    },
    {
      name: t('documents'),
      href: '/documents',
      icon: ArrowsTransaction,
      current: location.pathname.startsWith('/documents'),
      rightButton: {
        icon: Plus,
        to: '/documents/create',
        label: t('new_document'),
        visible: true,
      },
      visible: false,
      subOptions: [
        {
          name: t('blueprints'),
          href: '/documents/blueprints',
          icon: File,
          visible: false,
          current: location.pathname.startsWith('/documents/blueprints'),
          rightButton: {
            icon: Plus,
            to: '/documents/blueprints/create',
            label: t('new_blueprint'),
            visible: true,
          },
        },
        {
          name: t('users'),
          href: '/documents/users',
          icon: Users,
          current: location.pathname.startsWith('/documents/users'),
          visible: false,
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
      current: location.pathname.startsWith('/settings'),
      visible: Boolean(company),
    },
  ]);

  useEffect(() => {
    window.addEventListener('navigation.changeVisibility', (event) => {
      const { href, visible } = (event as CustomEvent).detail as {
        href: string;
        visible: boolean;
      };

      setNavigation((current) => {
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

    setTimeout(() => {
      $visibility('/documents', true);
    }, 5000);

    setTimeout(() => {
      $visibility('/documents/blueprints', true);
    }, 8000);

    setTimeout(() => {
      $visibility('/documents/users', true);
    }, 10_000);
  }, []);

  return navigation;
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
