import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createInstance } from 'i18next';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { AccountPlanExpired } from '$app/components/banners/AccountPlanExpired';

const i18n = createInstance();
const queryClient = new QueryClient();

void i18n
  .init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          account_plan_expired: 'Your account plan has expired',
          pay_now: 'Pay now',
        },
      },
    },
  })
  .then(() => {
    const root = createRoot(document.getElementById('root')!);
    const render = (params: URLSearchParams) => {
      const account = {
        plan: params.get('plan') ?? 'pro',
        plan_expires: params.get('expires'),
      };
      const state = {
        companyUsers: {
          currentIndex: 0,
          api: [
            {
              is_owner: params.get('owner') !== 'false',
              account,
            },
          ],
        },
        user: { user: {} },
      };
      const store = configureStore({ reducer: () => state });
      queryClient.setQueryData(
        ['/api/v1/refresh_react', 'account_status'],
        account
      );
      flushSync(() =>
        root.render(
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18n}>
                <MemoryRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <main data-testid="ready">
                    <AccountPlanExpired />
                  </main>
                </MemoryRouter>
              </I18nextProvider>
            </QueryClientProvider>
          </Provider>
        )
      );
    };
    // Test-only updates avoid reloading the application for every clock instant.
    window.addEventListener('account-plan:render', (event) => {
      render(new URLSearchParams((event as CustomEvent<string>).detail));
    });
    render(new URLSearchParams(window.location.search));
  });
