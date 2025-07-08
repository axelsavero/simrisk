// resources/js/types/index.d.ts (FINAL VERSION)

import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

// User interface with role support
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    roles?: Array<{
        id: number;
        name: string;
        guard_name: string;
        description?: string;
    }>;
    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
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
    role?: string;
    children?: NavItem[];
}

// Model interfaces with consistent naming
export interface Penyebab {
    id: number;
    identify_risk_id: number;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface DampakKualitatif {
    id: number;
    identify_risk_id: number;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface PenangananRisiko {
    id: number;
    identify_risk_id: number;
    description: string;
    created_at: string;
    updated_at: string;
}

// Main IdentifyRisk interface
export interface IdentifyRisk {
    unit_kerja?: string;
    bukti_files?: string[];
    id: number;
    id_identify: string;
    status: boolean;
    risk_category: string;
    identification_date_start: string;
    identification_date_end: string;
    description: string;
    nama_risiko?: string;
    jabatan_risiko?: string;
    no_kontak?: string;
    strategi?: string;
    pengendalian_internal?: string;
    biaya_penangan?: number;
    probability: number;
    impact: number;
    level: number;
    validation_status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
    validation_processed_at?: string | null;
    validation_processed_by?: number | null;
    rejection_reason?: string | null;

    // Status flags untuk UI
    can_be_submitted?: boolean;
    can_be_edited?: boolean;
    is_draft?: boolean;

    // Relationships
    penyebab?: Array<{ description: string }>;
    dampak_kualitatif?: Array<{ description: string }>;
    penanganan_risiko?: Array<{ description: string }>;

    created_at?: string;
    updated_at?: string;
}

// Pagination interface
export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// SharedPageProps with consistent naming
export interface SharedPageProps {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    flash?: {
        success?: string;
        error?: string;
    };

    permissions?: {
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canSubmit: boolean;
        canValidate: boolean;
        canApprove: boolean;
        canReject: boolean;
    };

    userRole?: string[];

    // Page-specific props
    users?: PaginatedData<User>;
    allRoles?: string[];
    identifyRisks?: PaginatedData<IdentifyRisk>;
    identifyRisk?: IdentifyRisk | null;

    [key: string]: unknown;
}

export interface SasaranUniv {
    id_sasaran_univ: number;
    kategori: string;
    nama_dokumen?: string;
    nomor_dokumen?: string;
    tanggal_dokumen?: string;
    file_path?: string;
    created_at: string;
    updated_at: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

// Generic type for Inertia page props
export type InertiaPageProps<P extends Record<string, unknown> = Record<string, unknown>> = P & SharedPageProps;
