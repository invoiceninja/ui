import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppleSignin } from '$app/components/AppleSignin';
import { QRCode } from '$app/components/QRCode';
import { VerificationInput } from '$app/components/VerificationInput';

function VerificationInputFixture() {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const sendCode = async () => {
    const response = await fetch('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+15555550100' }),
    });

    if (!response.ok) {
      throw new Error(`Verification request failed: ${response.status}`);
    }

    setIsConfirmationVisible(true);
  };

  return (
    <main>
      <section aria-label="CommonJS component adapters">
        <QRCode
          aria-label="Two-factor QR code"
          size={156}
          value="otpauth://totp/InvoiceNinja:test"
        />

        <AppleSignin
          authOptions={{
            clientId: 'com.invoiceninja.client',
            redirectURI: 'https://invoicing.co/auth/apple',
            scope: 'email name',
          }}
          onError={() => undefined}
          onSuccess={() => undefined}
          skipScript
          uiType="dark"
        />
      </section>

      <button type="button" onClick={sendCode}>
        Send Code
      </button>

      {isConfirmationVisible && (
        <section aria-label="SMS Code">
          <VerificationInput />
        </section>
      )}
    </main>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Verification input fixture root was not found');
}

createRoot(root).render(<VerificationInputFixture />);
