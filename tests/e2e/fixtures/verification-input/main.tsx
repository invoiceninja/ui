import { useState } from 'react';
import { createRoot } from 'react-dom/client';
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
