// resources/js/Layouts/AuthenticatedLayout.tsx
import { AppSidebar } from '@/components/app-sidebar'; // Pastikan path ini benar! Bisa juga '@/Pages/AppSidebar' atau dari starter kit
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
// import { AppSidebar } from '@/Pages/AppSidebar'; // Contoh jika di Pages

interface AuthenticatedLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AuthenticatedLayout({ children, title }: AuthenticatedLayoutProps) {
    return (
        <>
            {title && <Head title={title} />}
            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                {' '}
                {/* Tambahkan dark mode class jika ada */}
                <AppSidebar />
                <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
            </div>
        </>
    );
}
