import { configureStore } from '@reduxjs/toolkit';
import { createInstance } from 'i18next';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { AccountPlanExpired } from '$app/components/banners/AccountPlanExpired';

const params = new URLSearchParams(window.location.search);
const state = {
  companyUsers: {
    currentIndex: 0,
    api: [
      {
        is_owner: params.get('owner') !== 'false',
        account: {
          plan: params.get('plan') ?? 'pro',
          plan_expires: params.get('expires'),
        },
      },
    ],
  },
  user: { user: {} },
};
const store = configureStore({ reducer: () => state });
const i18n = createInstance();

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
    createRoot(document.getElementById('root')!).render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <main data-testid="ready">
              <AccountPlanExpired />
            </main>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
  });
