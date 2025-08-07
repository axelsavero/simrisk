// resources/js/Pages/User/Manage.tsx

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { PageProps } from '@/types/page-props';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2, UserRoundPlus } from 'lucide-react';
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
                {flash?.success && <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{flash.success}</div>}
                {flash?.error && <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{flash.error}</div>}

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">User Management</h3>
                    {isSuperAdmin && (
                        <Button asChild className="rounded-lg border bg-[#12745A] px-4 py-2 font-medium text-white">
                            <Link href="/user/manage/create">
                                <UserRoundPlus />
                                Tambah User
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="border-sidebar-border overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto p-4">
                        <table className="min-w-full border border-gray-300 text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="w-2 border px-2 py-2 text-center">No</th>
                                    <th className="w-2/5 border px-4 py-2">Unit</th>
                                    <th className="w-1/4 border px-2 py-2">User Admin</th>
                                    <th className="w-2 border px-1 py-2 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users && users.length > 0 ? (
                                    users.map((user: User, idx: number) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="border px-2 py-2 text-center">{idx + 1}</td>
                                            <td className="border px-4 py-2">{typeof user.unit === 'string' ? user.unit : ''}</td>
                                            <td className="border px-2 py-2">{user.name}</td>
                                            <td className="border px-1 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <Link href={`/user/manage/${user.id}/edit`}>
                                                            <Pencil size={20} />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className='className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-500 hover:text-white'
                                                        onClick={() => deleteUser(user)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            Tidak ada data user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
