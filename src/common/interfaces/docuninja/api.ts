export interface GenericSingleResponse<T> {
    data: T;
}

export interface GenericManyResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: string | null;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: string | null;
        total: number;
    };
}

export type WithSignerToken<T> = T & {
    "X-Signer-Token": string;
    "X-Signer-Token-Expires": string;
};

export interface Company {
    id: string;
    account_id: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postal_code: string;
    country_id: string;
    currency_id: string;
    language_id: string;
    timezone_id: string;
    subdomain: string;
    website: string;
    logo: string;
    role: string;
    onboarding_completed_at: string; // ISO date string
    created_at: string; // ISO date string
    updated_at: string; // ISO date string

    // Relations
    users?: User[];
    pivot?: CompanyUser | null;
    documents?: Document[];
}

export interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
    type_id: number;
}

export interface Account {
    id: string;
    plan: string | null;
    plan_term: string | null;
    plan_expires: string | null; // ISO date string
    plan_paid: string | null; // ISO date string
    trial_ends_at: string | null; // ISO date string
    num_users: number;
    is_active: boolean;
    pending_downgrade: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    default_company?: Company; // Relation
    companies?: Company[]; // Relation
    users?: User[]; // Relation
    gateway_tokens?: GatewayToken[]; // Relation
}

export interface GatewayToken {
    id: string;
    token: string | null;
    customer_id: string | null;
    expiry_month: string | null;
    expiry_year: string | null;
    brand: string | null;
    last4: string | null;
    is_default: boolean;
}

export interface ActivityLog {
    id: string;
    company_id: string;
    user_id: string;
    user_type: string;
    ip_address: string | null;
    user_agent: string | null;
    subject_type: string;
    subject_id: number;
    event: string;
    event_type: string | null;
    properties: Record<string, unknown> | null;
    description: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: string;
    user_id: string;
    company_id: string;
    name: string | null;
    website: string | null;
    private_notes: string | null;
    public_notes: string | null;
    logo: string | null;
    phone: string | null;
    balance: number;
    paid_to_date: number;
    currency_id: number | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country_id: number | null;
    is_deleted: boolean;
    vat_number: string | null;
    id_number: string | null;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
    contacts?: ClientContact[];
}

export interface ClientContact {
    id: string;
    user_id: string;
    company_id: string;
    client_id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    signature_base64: string | null;
    initials_base64: string | null;
    email_verified_at: string | null; // ISO date string
    is_primary: boolean;
    last_login: string | null; // ISO date string
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    archived_at: string | null; // ISO date string
    e_signature: string | null;
    e_initials: string | null;
    // Relations
    user?: User;
    company?: Company;
    client?: Client;
}

export interface CompanyUser {
    id: string;
    is_owner: boolean;
    is_admin: boolean;
    account_id: string;
    company_id: string;
    user_id: string;
    permissions: Array<unknown> | null;
    role: string;
    created_at: string; // ISO 8601 date string
    updated_at: string; // ISO 8601 date string
    archived_at: string | null; // ISO 8601 date string
}

export interface Document {
    id: string;
    description: string;
    status_id: number;
    is_deleted: boolean;
    user_id: string;
    company_id: string;
    completed_at: string | null; // ISO date string
    voided_at: string | null; // ISO date string
    created_at: string | null; // ISO date string
    updated_at: string | null; // ISO date string
    archived_at: string | null; // ISO date string

    // Relations
    user?: User | null;
    company?: Company | null;
    invitations?: DocumentInvitation[];
    files?: DocumentFile[];
    signatures?: DocumentSignature[];
}

export interface DocumentFile {
    id: string;
    user_id: string;
    document_id: string;
    filename: string;
    path: string;
    hash: string;
    disk: string;
    mime_type: string;
    file_size: number;
    page_position: number;
    page_count: number | null;
    url: string | null;
    previews: string[];
    metadata: Record<string, unknown> | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface DocumentInvitation {
    id: string;
    user_id: string;
    client_contact_id: string | null;
    client_id: string | null;
    company_id: string;
    document_id: string;
    message_id: string | null;
    email_error: string | null;
    entity: "contact" | "user";
    sent_date: string | null; // ISO 8601 date string
    viewed_date: string | null; // ISO 8601 date string
    opened_date: string | null; // ISO 8601 date string
    signed_date: string | null; // ISO 8601 date string
    ip_address: string | null;
    created_at: string; // ISO 8601 date string
    updated_at: string; // ISO 8601 date string
    archived_at: string | null; // ISO 8601 date string

    // Relations
    user?: User;
    company?: Company;
    document?: Document;
    contact?: ClientContact;
}

export interface DocumentSignature {
    id: string;
    document_id: string;
    document_file_id: string;
    client_contact_id: string;
    user_id: string;
    page_number: number;
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    type: string;
    value: string | null;
    ip_address: string;
    signed_at: string; // ISO 8601 date string
    created_at: string; // ISO 8601 date string
    updated_at: string; // ISO 8601 date string

    // Relations
    user?: User;
    contact?: ClientContact | null;
    document?: Document;
    file?: DocumentFile;
}

export interface User {
    id: string;
    account_id: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    email: string;
    phone_number_verified: boolean;
    is_deleted: boolean;
    referral_code: string | null;
    oauth_user_id: string | null;
    oauth_user_token: string | null;
    oauth_provider_id: string | null;
    google_2fa_secret: string | null;
    accepted_terms_version: string | null;
    avatar: string;
    e_signature: string | null;
    e_initials: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    archived_at: string | null; // ISO date string
    email_verified_at: string | null; // ISO date string
    companies?: Company[]; // Related companies
    account: Account | null;
}

export interface Timezone {
    id: string;
    location: string;
    name: string;
    utc_offset: number;
}

export interface Currency {
    id: string;
    code: string;
    decimal_separator: string;
    exchange_rate: number;
    name: string;
    precision: number;
    swap_currency_symbol: boolean;
    symbol: string;
    thousand_separator: string;
}

export interface Language {
    id: string;
    locale: string;
    name: string;
}

export interface Country {
    id: string;
    capital: string;
    citizenship: string;
    country_code: string;
    currency: string;
    currency_code: string;
    currency_sub_unit: string;
    full_name: string;
    iso_3166_2: string;
    iso_3166_3: string;
    name: string;
    region_code: string;
    sub_region_code: string;
    eea: boolean;
    swap_postal_code: boolean;
    swap_currency_symbol: boolean;
    thousand_separator: string;
    decimal_separator: string;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    popular: boolean;
    price: {
        month: number;
        year: number;
    };
    features: string[];
    highlighted_features: string[];
}
