import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
// 1. Import hook usePage dari Inertia
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, User, Target, ShieldCheck, ListChecks, Minus } from 'lucide-react';
import AppLogo from './app-logo';
import React, { useState } from 'react';

// Define PageProps type if not imported from elsewhere
type PageProps = {
    auth: {
        user?: {
            roles?: string[];
            // add other user properties if needed
        };
        // add other auth properties if needed
    };
};

export function AppSidebar() {
    // 2. Ambil data 'auth' dari props yang dibagikan Inertia
    const { auth } = usePage<PageProps>().props;
    const [collapsed, setCollapsed] = useState(false);

    // 3. Definisikan SEMUA kemungkinan item navigasi di sini
    // Kita tambahkan properti baru 'role' untuk item yang butuh hak akses khusus
    const allNavItems: (NavItem & { role?: string })[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'User Admin',
            href: '/user/manage',
            icon: User,
            role: 'super-admin', // <-- Item ini hanya untuk peran 'super admin'
        },
        {
            title: 'Sasaran',
            href: '/sasaran-univ',
            icon: Target,
            role: 'super-admin', // <--
        },

        {
            title: 'Identifikasi Risiko',
            href: '/identify-risk', // Menggunakan nama route
            icon: ShieldCheck,
            role: 'owner-risk', // Hanya untuk peran 'operator'
        },

        {
            title: 'Validasi',
            href: '/validasi',
            icon: ListChecks,
            children: [
                {
                    title: 'Validasi Identifikasi Risiko',
                    href: '/identify-risk',
                    role: 'super-admin', // Hanya untuk peran 'super admin'
                },
                {
                    title: 'Validasi Evaluasi Risiko',
                    href: '/validasi/evaluasi',
                },
            ],
        },
        {
            title: 'Laporan',
            href: '/laporan',
            icon: BookOpen,
        },
    ];

    // 4. Saring (filter) daftar menu berdasarkan peran user
    const mainNavItems = allNavItems.filter((item) => {
        // Jika sebuah item tidak memiliki properti 'role', selalu tampilkan
        if (!item.role) {
            return true;
        }

        // Jika item memiliki properti 'role', cek apakah user punya peran tersebut
        // 'auth.user?.roles' berasal dari middleware HandleInertiaRequests
        return auth.user?.roles?.includes(item.role);
    });

    return (
        <Sidebar
            variant="inset"
            className={collapsed ? 'w-16' : 'w-64'} // atur lebar sidebar
        >
            <SidebarHeader className="mb-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild onClick={() => setCollapsed(!collapsed)}>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems as NavItem[]} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
