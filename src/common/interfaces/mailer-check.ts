/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface OAuthMailerCheckPayload {
  mailer: 'gmail' | 'office365' | 'microsoft';
}

export interface BrevoMailerCheckPayload {
  mailer: 'client_brevo';
  from_address: string;
  from_name?: string;
  brevo_secret: string;
}

export interface MailgunMailerCheckPayload {
  mailer: 'client_mailgun';
  from_address: string;
  from_name?: string;
  mailgun_secret: string;
  mailgun_domain: string;
  mailgun_endpoint: 'api.mailgun.net' | 'api.eu.mailgun.net';
}

export interface PostmarkMailerCheckPayload {
  mailer: 'client_postmark';
  from_address: string;
  from_name?: string;
  postmark_secret: string;
}

export interface SesMailerCheckPayload {
  mailer: 'client_ses';
  from_address: string;
  from_name?: string;
  ses_access_key: string;
  ses_secret_key: string;
  ses_region: string;
  ses_topic_arn?: string;
}

export interface SmtpMailerCheckPayload {
  mailer: 'smtp';
  smtp_host: string;
  smtp_port: string;
  smtp_encryption: string;
  smtp_username: string;
  smtp_password: string;
  smtp_local_domain: string;
  smtp_verify_peer: boolean;
}

export type MailerCheckPayload =
  | OAuthMailerCheckPayload
  | BrevoMailerCheckPayload
  | MailgunMailerCheckPayload
  | PostmarkMailerCheckPayload
  | SesMailerCheckPayload
  | SmtpMailerCheckPayload;

export interface MailerCheckResponse {
  message: string;
  mailer: string;
}
