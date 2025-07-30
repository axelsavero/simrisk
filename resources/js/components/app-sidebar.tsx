import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
  BookOpen,
  Folder,
  LayoutGrid,
  User,
  Target,
  ListChecks,
} from 'lucide-react';
import AppLogo from './app-logo';
import React, { useState } from 'react';

// 1. Buat ulang tipe NavItem agar tidak bentrok dengan tipe dari '@/types'
type NavItem = {
  title: string;
  href: string;
  icon?: any;
  children?: NavItem[];
  role?: string[]; // mendukung banyak role
};

// 2. Tipe PageProps untuk akses auth.roles dari Inertia
type PageProps = {
  auth: {
    user?: {
      roles?: string[]; // misalnya: ['admin'], ['super-admin'], ['owner-risk']
    };
  };
};

export function AppSidebar() {
  const { auth } = usePage<PageProps>().props;
  const [collapsed, setCollapsed] = useState(false);

  // 3. Semua menu, dengan role tertentu jika dibutuhkan
  const allNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      title: 'Referensi',
      href: '/referensi',
      icon: Folder,
      role: ['admin', 'owner-risk'],
    },
    {
      title: 'Sasaran',
      href: '/sasaran',
      icon: Target,
      role: ['admin'],
    },
    {
      title: 'Kelola Risiko',
      href: '/kelola-risiko',
      icon: ListChecks,
      role: ['owner-risk'],
      children: [
        {
          title: 'Identifikasi Risiko',
          href: '/identify-risk',
        },
        {
          title: 'Mitigasi Risiko',
          href: '/mitigasi',
        },
      ],
    },
    {
      title: 'User Admin',
      href: '/user/manage',
      icon: User,
      role: ['super-admin'],
    },
    {
      title: 'Sasaran',
      href: '/sasaran-univ',
      icon: Target,
      role: ['super-admin'],
    },
    {
      title: 'Validasi',
      href: '/validasi',
      icon: ListChecks,
      role: ['super-admin'],
      children: [
        {
          title: 'Validasi Identifikasi Risiko',
          href: '/identify-risk',
        },
        {
          title: 'Validasi Evaluasi Risiko',
          href: '/mitigasi',
        },
      ],
    },
    {
      title: 'Laporan',
      href: '/laporan',
      icon: BookOpen,
    },
  ];

  // 4. Filter berdasarkan role user
  const mainNavItems = allNavItems.filter((item) => {
    if (!item.role) return true;
    return item.role.some((r) => auth.user?.roles?.includes(r));
  });

  return (
    <Sidebar variant="inset" className={collapsed ? 'w-16' : 'w-64'}>
      <SidebarHeader className="mb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              onClick={() => setCollapsed(!collapsed)}
            >
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
