// resources/js/Pages/User/Manage.tsx

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { PageProps } from '@/types/page-props';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Manage({ users }: PageProps<{ users: User[] }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.roles?.includes('super-admin');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen User', href: '/user/manage' },
    ];

    function deleteUser(user: User) {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `User "${user.name}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/user/manage/${user.id}`);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-col gap-4 p-4">
                {/* Flash Message */}
                {flash?.success && <div className="alert alert-success">{flash.success}</div>}
                {flash?.error && <div className="alert alert-danger">{flash.error}</div>}

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">User Management</h3>
                    {isSuperAdmin && (
                        <div className="rounded-lg border bg-[#12745A] p-2 px-4 py-2 font-medium text-white">
                            <Link href="/user/manage/create" className="btn btn-primary">
                                Tambah User Baru
                            </Link>
                        </div>
                    )}
                </div>

                <div className="border-sidebar-border overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto p-4">
                        <table className="min-w-full border border-gray-300 text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2">ID</th>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Email</th>
                                    <th className="border px-4 py-2">Roles</th>
                                    {isSuperAdmin && <th className="border px-4 py-2">Aksi</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{user.id}</td>
                                        <td className="border px-4 py-2">{user.name}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">{user.roles?.join(', ') || '-'}</td>
                                        {isSuperAdmin && (
                                            <td className="flex flex-wrap gap-2 border px-6 py-4">
                                                <Link
                                                    href={`/user/manage/${user.id}/edit`}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 transition-colors hover:bg-yellow-400 hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Pencil size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 transition-colors hover:bg-red-500 hover:text-white"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
