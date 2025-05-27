import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
// 1. Import hook usePage dari Inertia
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { BookOpen, LayoutGrid, User, Target, ShieldCheck } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    // 2. Ambil data 'auth' dari props yang dibagikan Inertia
    const { auth } = usePage<PageProps>().props;

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
            href: '/sasaran',
            icon: Target,
        },
        {
            title: 'Validasi',
            href: '/validasi',
            icon: ShieldCheck,
            children: [
                {
                    title: 'Validasi Identifikasi Risiko',
                    href: '/validasi/identifikasi',
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
    const mainNavItems = allNavItems.filter(item => {
        // Jika sebuah item tidak memiliki properti 'role', selalu tampilkan
        if (!item.role) {
            return true;
        }

        // Jika item memiliki properti 'role', cek apakah user punya peran tersebut
        // 'auth.user?.roles' berasal dari middleware HandleInertiaRequests
        return auth.user?.roles?.includes(item.role);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className='mb-6'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* 5. Gunakan array 'mainNavItems' yang sudah disaring */}
                <NavMain items={mainNavItems as NavItem[]} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
