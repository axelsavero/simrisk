// resources/js/Pages/User/Manage.tsx

import { Link, Head, usePage } from '@inertiajs/react';
import { PageProps, User, BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
        cancelButtonText: 'Batal'
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
                {flash?.success && (
                    <div className="alert alert-success">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="alert alert-danger">{flash.error}</div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">User Management</h3>
                    {isSuperAdmin && (
                    <div className="border rounded-lg p-2 bg-[#12745A] text-white px-4 py-2 font-medium dark:bg-[#12745A] dark:text-white">
                     <Link
                          href="/user/manage/create"
                            className="btn btn-primary"
                      >
                          Tambah User Baru
                       </Link>
                      </div>
                        )}

                </div>

                <div className="rounded-xl border border-sidebar-border overflow-hidden shadow-sm bg-white dark:bg-neutral-900">
                    <div className="p-4 overflow-x-auto">
                       <table className="min-w-full border border-gray-300 text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-neutral-800">
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
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                                        <td className="border px-4 py-2">{user.id}</td>
                                        <td className="border px-4 py-2">{user.name}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">{user.roles.join(', ')}</td>
                                        {isSuperAdmin && (
                                            <td className="border px-6 py-4 flex flex-wrap gap-2">
                                                <Link
                                                    href={`/user/manage/${user.id}/edit`}
                                                     className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        ✏️ Edit
                                                </Link>
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                    >
                                                        🗑️ Hapus
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
