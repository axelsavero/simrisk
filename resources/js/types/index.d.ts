import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[]; // Kita tahu dari backend ini adalah array of strings
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null; // User bisa ada atau null (jika guest)
    };
    // Tambahkan properti lain yang Anda bagikan secara global di sini
    // contohnya flash messages
    flash: {
        success?: string;
        error?: string;
    };
};

export interface IdentityRisk {
    id: number;
    id_identity: string;
    status: boolean;
    risk_category: string;
    identification_date_start: string; // format YYYY-MM-DD
    identification_date_end: string; // format YYYY-MM-DD
    description: string;
    probability: number;
    impact: number;
    level: number;
    created_at?: string;
    updated_at?: string;
    // Nanti bisa ditambahkan relasi, contoh:
    // penyebab?: Array<{ id: number; description: string }>;
}

// Tipe untuk data paginasi
export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Tipe untuk props global Inertia
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    ziggy: Config & { location: string }; // Jika menggunakan Ziggy
    // Tambahkan props spesifik halaman jika diperlukan
    identityRisks?: PaginatedData<IdentityRisk>;
    identityRisk?: IdentityRisk; // Untuk form edit/create
    allRoles?: string[]; // Dari User Management
};
