import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
// Import hook usePage dari Inertia
import { Link, usePage } from '@inertiajs/react'; 
import { BookOpen, Folder, LayoutGrid, User } from 'lucide-react';
import AppLogo from './app-logo';

// Pindahkan array item navigasi footer ke luar karena isinya statis
const footerNavItems: NavItem[] = [
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, User, Target, ShieldCheck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'User Admin',
        href: '/useradmin',
        icon: User,
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

export function AppSidebar() {
    // 1. Ambil shared props menggunakan hook usePage()
    const { auth } = usePage().props;

    // 2. Bangun navigasi utama secara dinamis
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // 3. Cek apakah user memiliki peran 'super admin'
    // Logika ini sama, tapi sekarang kita mengambil data dari `auth.user`
    const isSuperAdmin = auth.user?.roles?.includes('super-admin');

    // 4. Jika user adalah super admin, tambahkan item menu 'User Admin'
    if (isSuperAdmin) {
        mainNavItems.push({
            title: 'User Admin',
            href: '/user/management',
            icon: User,
        });
    }

    // Kamu bisa menambahkan kondisi 'else if' lain di sini untuk role berbeda
    // if (isAdmin) { mainNavItems.push(...) }
    
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
                {/* 5. Gunakan array yang sudah dinamis */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}