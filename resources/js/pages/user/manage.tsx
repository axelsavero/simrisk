// resources/js/Pages/User/Manage.tsx

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { PageProps } from '@/types/page-props';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2, UserRoundPlus } from 'lucide-react';
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

    const adminUsers = users.filter((user: any) => user.roles?.includes('admin'));

    const columns: ColumnDef<User>[] = [
        {
            id: 'no',
            header: () => <div className="text-center">No</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: 'unit',
            header: 'Unit Kerja',
            cell: ({ row }) => <div>{row.original.unit || '-'}</div>,
        },
        {
            accessorKey: 'name',
            header: 'User Admin',
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div>{row.original.email || '-'}</div>,
        },
        {
            accessorKey: 'roles',
            header: 'Role',
            cell: ({ row }) => (
                <div>
                    {Array.isArray(row.original.roles) ? row.original.roles.join(', ') : row.original.roles || '-'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center justify-center gap-1">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-500 hover:text-white"
                            title="Detail"
                        >
                            <Link href={`/user/manage/${user.id}/edit`}>
                                <Eye size={20} />
                            </Link>
                        </Button>
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
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-500 hover:text-white"
                            onClick={() => deleteUser(user)}
                            title="Hapus"
                        >
                            <Trash2 size={20} />
                        </Button>
                    </div>
                );
            },
        },
    ];

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
                        <Button asChild className="rounded-lg border bg-[#006d77] px-4 py-2 font-medium text-white">
                            <Link href="/user/manage/create">
                                <UserRoundPlus />
                                Tambah Admin
                            </Link>
                        </Button>
                    )}
                </div>

                <DataTable columns={columns} data={adminUsers} />
            </div>
        </AppLayout>
    );
}
