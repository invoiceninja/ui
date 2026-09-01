/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Company } from '$app/common/interfaces/company.interface';
import { MailerCheckPayload } from '$app/common/interfaces/mailer-check';

export const MAILER_CHECK_FIELD_LABELS: Record<string, string> = {
  from_address: 'from_email',
  brevo_secret: 'secret',
  postmark_secret: 'secret',
  mailgun_secret: 'secret',
  mailgun_domain: 'domain',
  ses_access_key: 'ses_access_key',
  ses_secret_key: 'ses_secret_key',
  ses_region: 'region',
  smtp_host: 'host',
  smtp_port: 'port',
  smtp_username: 'username',
  smtp_password: 'password',
};

export const BOUND_MAILER_CHECK_FIELDS = [
  'mailer',
  'from_address',
  'from_name',
  'brevo_secret',
  'postmark_secret',
  'mailgun_secret',
  'mailgun_domain',
  'mailgun_endpoint',
  'ses_access_key',
  'ses_secret_key',
  'ses_region',
  'ses_topic_arn',
  'smtp_host',
  'smtp_port',
  'smtp_encryption',
  'smtp_username',
  'smtp_password',
  'smtp_local_domain',
];

export interface MailerCheckDraft {
  payload: MailerCheckPayload;
  missingFields: string[];
}

const trimmed = (value: string | undefined) => {
  return (value || '').trim();
};

export const isOAuthMailer = (mailer: string | undefined) => {
  return mailer === 'gmail' || mailer === 'office365' || mailer === 'microsoft';
};

const resolveFromAddress = (
  company: Company,
  userEmail: string | undefined
) => {
  if (company.settings.email_sending_method === 'client_ses') {
    return (
      trimmed(company.settings.ses_from_address) ||
      trimmed(company.settings.custom_sending_email) ||
      trimmed(userEmail)
    );
  }

  return trimmed(company.settings.custom_sending_email) || trimmed(userEmail);
};

const resolveMailgunEndpoint = (value: string | undefined) => {
  return trimmed(value) === 'api.eu.mailgun.net'
    ? 'api.eu.mailgun.net'
    : 'api.mailgun.net';
};

const buildSmtpDraft = (company: Company): MailerCheckDraft => {
  const missingFields: string[] = [];

  if (!trimmed(company.smtp_host)) {
    missingFields.push('smtp_host');
  }

  if (!trimmed(company.smtp_port)) {
    missingFields.push('smtp_port');
  }

  if (!trimmed(company.smtp_username)) {
    missingFields.push('smtp_username');
  }

  if (!trimmed(company.smtp_password)) {
    missingFields.push('smtp_password');
  }

  return {
    payload: {
      mailer: 'smtp',
      smtp_host: company.smtp_host || '',
      smtp_port: company.smtp_port || '',
      smtp_encryption: company.smtp_encryption || '',
      smtp_username: company.smtp_username || '',
      smtp_password: company.smtp_password || '',
      smtp_local_domain: company.smtp_local_domain || '',
      smtp_verify_peer: company.smtp_verify_peer ?? true,
    },
    missingFields,
  };
};

export const buildMailerCheckDraft = (
  company: Company | undefined,
  userEmail: string | undefined
): MailerCheckDraft | null => {
  if (!company) {
    return null;
  }

  const mailer = company.settings.email_sending_method;

  if (mailer === 'gmail' || mailer === 'office365' || mailer === 'microsoft') {
    return { payload: { mailer }, missingFields: [] };
  }

  if (mailer === 'smtp') {
    return buildSmtpDraft(company);
  }

  const missingFields: string[] = [];

  const fromAddress = resolveFromAddress(company, userEmail);
  const fromName = trimmed(company.settings.email_from_name);
  const fromNamePart: { from_name?: string } = fromName
    ? { from_name: fromName }
    : {};

  if (!fromAddress) {
    missingFields.push('from_address');
  }

  if (mailer === 'client_brevo') {
    const brevoSecret = trimmed(company.settings.brevo_secret);

    if (brevoSecret.length < 3) {
      missingFields.push('brevo_secret');
    }

    return {
      payload: {
        mailer,
        from_address: fromAddress,
        ...fromNamePart,
        brevo_secret: brevoSecret,
      },
      missingFields,
    };
  }

  if (mailer === 'client_mailgun') {
    const mailgunSecret = trimmed(company.settings.mailgun_secret);
    const mailgunDomain = trimmed(company.settings.mailgun_domain);

    if (!mailgunSecret) {
      missingFields.push('mailgun_secret');
    }

    if (!mailgunDomain) {
      missingFields.push('mailgun_domain');
    }

    return {
      payload: {
        mailer,
        from_address: fromAddress,
        ...fromNamePart,
        mailgun_secret: mailgunSecret,
        mailgun_domain: mailgunDomain,
        mailgun_endpoint: resolveMailgunEndpoint(
          company.settings.mailgun_endpoint
        ),
      },
      missingFields,
    };
  }

  if (mailer === 'client_postmark') {
    const postmarkSecret = trimmed(company.settings.postmark_secret);

    if (!postmarkSecret) {
      missingFields.push('postmark_secret');
    }

    return {
      payload: {
        mailer,
        from_address: fromAddress,
        ...fromNamePart,
        postmark_secret: postmarkSecret,
      },
      missingFields,
    };
  }

  if (mailer === 'client_ses') {
    const sesAccessKey = trimmed(company.settings.ses_access_key);
    const sesSecretKey = trimmed(company.settings.ses_secret_key);
    const sesRegion = trimmed(company.settings.ses_region);
    const sesTopicArn = trimmed(company.settings.ses_topic_arn);
    const topicArnPart: { ses_topic_arn?: string } = sesTopicArn
      ? { ses_topic_arn: sesTopicArn }
      : {};

    if (!sesAccessKey) {
      missingFields.push('ses_access_key');
    }

    if (!sesSecretKey) {
      missingFields.push('ses_secret_key');
    }

    if (!sesRegion) {
      missingFields.push('ses_region');
    }

    return {
      payload: {
        mailer,
        from_address: fromAddress,
        ...fromNamePart,
        ses_access_key: sesAccessKey,
        ses_secret_key: sesSecretKey,
        ses_region: sesRegion,
        ...topicArnPart,
      },
      missingFields,
    };
  }

  return null;
};

export const toMailerCheckRequest = (payload: MailerCheckPayload) => {
  if (payload.mailer === 'smtp') {
    return {
      url: '/api/v1/smtp/check',
      body: {
        smtp_host: payload.smtp_host,
        smtp_port: payload.smtp_port,
        smtp_encryption: payload.smtp_encryption,
        smtp_username: payload.smtp_username,
        smtp_password: payload.smtp_password,
        smtp_local_domain: payload.smtp_local_domain,
        smtp_verify_peer: payload.smtp_verify_peer,
      },
    };
  }

  return { url: '/api/v1/mailer/check', body: payload };
};
