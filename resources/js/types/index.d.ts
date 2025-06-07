// resources/js/types/index.d.ts

import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

// 1. Definisi User (Gabungan dan Disesuaikan)
export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;                   // Dari definisi pertama Anda
    email_verified_at?: string | null; // Dari definisi pertama Anda, null lebih tepat
    created_at?: string;               // Dari definisi pertama Anda (opsional jika tidak selalu dikirim)
    updated_at?: string;               // Dari definisi pertama Anda (opsional jika tidak selalu dikirim)
    roles?: string[];                  // Dari definisi kedua Anda & kebutuhan kita
    [key: string]: unknown;            // Dari definisi pertama Anda
}

// 2. Definisi untuk Autentikasi (User bisa null)
export interface Auth {
    user: User | null; // User bisa null jika tidak login
}

// 3. Definisi untuk Navigasi & Breadcrumbs
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
    role?: string; // Tambahan untuk sidebar dinamis
    children?: NavItem[];
}

export interface Penyebab {
    id: number;
    description: string;
}

export interface DampakKualitatif {
    id: number;
    identity_risk_id: number;
    description: string;
    created_at: string;
    updated_at: string;
}

// 4. Definisi untuk IdentityRisk
export interface IdentityRisk {
    id: number;
    id_identity: string;
    status: boolean;
    risk_category: string;
    identification_date_start: string; // format YYYY-MM-DD
    identification_date_end: string;   // format YYYY-MM-DD
    description: string;
    nama_risiko: string;
    jabatan_risiko: string;
    no_kontak: string;
    strategi: string;
    pengendalian_internal: string;
    biaya_penangan: string;
    probability: number;
    impact: number;
    level: number;
    created_at?: string;
    updated_at?: string;
    validation_status: 'pending' | 'approved' | 'rejected';
    validation_processed_at?: string | null;
    rejection_reason?: string | null;
    penyebab?: Array<{ description: string }>;
    dampak_kualitatif?: Array<{ description: string }>;
    penanganan_risiko?: Array<{ description: string }>;
}

// 5. Tipe untuk data paginasi Laravel
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

// 6. Definisi SharedPageProps (Ini adalah tipe untuk usePage().props)
// Menggabungkan SharedData Anda dengan tambahan yang kita perlukan
export interface SharedPageProps {
    // Dari SharedData Anda sebelumnya:
    name: string; // Nama aplikasi
    quote: { message: string; author: string };
    auth: Auth;   // Menggunakan interface Auth yang sudah disesuaikan
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    // Tambahan dari diskusi kita:
    flash?: {
        success?: string;
        error?: string;
    };
    canValidate?: boolean; // Untuk hak validasi super-admin

    // Props yang mungkin dikirim ke halaman spesifik dan ingin diakses via usePage().props
    // Ini bisa juga didefinisikan hanya pada tipe props komponen halaman jika tidak benar-benar "shared"
    users?: PaginatedData<User>;          // Untuk User/Manage.tsx
    allRoles?: string[];                 // Untuk User/Form.tsx

    identityRisks?: PaginatedData<IdentityRisk>; // Untuk IdentityRisk/Index.tsx
    identityRisk?: IdentityRisk | null;          // Untuk IdentityRisk/Form.tsx (bisa null saat create)
    
    [key: string]: unknown; // Memungkinkan properti lain yang dibagikan
}

// 7. Tipe Generik untuk Props Komponen Halaman Inertia
// Ini adalah pola yang baik untuk mendefinisikan props di komponen Halaman Anda.
// `P` adalah tipe untuk props spesifik halaman tersebut (misalnya `{ products: Product[] }`).
export type InertiaPageProps<P extends Record<string, unknown> = Record<string, unknown>> = P & SharedPageProps;

/*
   Cara penggunaan InertiaPageProps di komponen halaman Anda:

   A. Jika halaman Anda menerima props spesifik bernama 'specificData':
   ================================================================
   // resources/js/Pages/MyPage.tsx
   import { InertiaPageProps, MySpecificDataType, SharedPageProps } from '@/types';
   import { usePage } from '@inertiajs/react';

   interface MyPageSpecificProps {
       specificData: MySpecificDataType;
   }

   export default function MyPage({ specificData }: InertiaPageProps<MyPageSpecificProps>) {
       // Anda bisa mengakses specificData secara langsung
       // Dan juga props global dari usePage jika diperlukan (meskipun sudah ada di props komponen)
       const { auth, flash } = usePage<SharedPageProps>().props;
       // atau langsung dari props: const { auth, flash } = props;

       // return