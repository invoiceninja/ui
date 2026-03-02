export interface PasskeyCredentialResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
  };
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64ToBuffer(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

export function prepareCreationOptions(publicKey: any) {
  return {
    ...publicKey,
    challenge: base64ToBuffer(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: base64ToBuffer(publicKey.user.id),
    },
    excludeCredentials:
      publicKey.excludeCredentials?.map((credential: any) => ({
        ...credential,
        id: base64ToBuffer(credential.id),
      })) ?? [],
  };
}

export function prepareRequestOptions(publicKey: any) {
  return {
    ...publicKey,
    challenge: base64ToBuffer(publicKey.challenge),
    allowCredentials:
      publicKey.allowCredentials?.map((credential: any) => ({
        ...credential,
        id: base64ToBuffer(credential.id),
      })) ?? [],
  };
}

export async function registerPasskey(publicKey: any): Promise<PasskeyCredentialResponse> {
  const credential = (await navigator.credentials.create({
    publicKey: prepareCreationOptions(publicKey),
  })) as PublicKeyCredential;

  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      attestationObject: bufferToBase64(response.attestationObject),
    },
  };
}

export async function authenticatePasskey(
  publicKey: any
): Promise<PasskeyCredentialResponse> {
  const credential = (await navigator.credentials.get({
    publicKey: prepareRequestOptions(publicKey),
  })) as PublicKeyCredential;

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      authenticatorData: bufferToBase64(response.authenticatorData),
      signature: bufferToBase64(response.signature),
      userHandle: response.userHandle ? bufferToBase64(response.userHandle) : null,
    },
  };
}
