// resources/js/Pages/User/Manage.tsx

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User, SharedPageProps as PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2, UserRoundPlus } from 'lucide-react';
import Select from 'react-select';
import Swal from 'sweetalert2';

function formatRoleLabel(role: string) {
    return role === 'owner-risk' ? 'operator' : role;
}

function toRoleNames(rawRoles: unknown): string[] {
    if (!rawRoles) return [];
    const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    return list.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
}

export default function Manage({ users, allRoles = [] }: { users: User[]; allRoles?: string[] }) {
    const { auth, flash } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.active_role === 'super-admin';

    function updateUserRoles(user: User, newRoles: string[]) {
        if (newRoles.length === 0) {
            Swal.fire('Role tidak boleh kosong', 'Pilih minimal satu role untuk user ini.', 'warning');
            return;
        }
        router.patch(
            `/user/manage/${user.id}/roles`,
            { roles: newRoles },
            {
                preserveScroll: true,
                onError: () => {
                    Swal.fire('Gagal', 'Gagal memperbarui role user.', 'error');
                },
            },
        );
    }

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

    const displayUsers = isSuperAdmin
        ? users
        : (users || []).filter((user: any) =>
              Array.isArray(user.roles) ? user.roles.includes('admin') : user.roles === 'admin'
          );

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
            header: isSuperAdmin ? 'Nama User' : 'User Admin',
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
            cell: ({ row }) => {
                const rolesArray = toRoleNames(row.original.roles);

                if (!isSuperAdmin) {
                    const formatted = rolesArray.map(formatRoleLabel).join(', ');
                    return <div>{formatted || '-'}</div>;
                }

                const options = allRoles.map((r) => ({ value: r, label: formatRoleLabel(r) }));

                return (
                    <div className="min-w-[220px]">
                        <Select
                            isMulti
                            options={options}
                            value={options.filter((opt) => rolesArray.includes(opt.value))}
                            onChange={(selected) => updateUserRoles(row.original, selected ? selected.map((opt) => opt.value) : [])}
                            classNamePrefix="react-select"
                            placeholder="Pilih role..."
                        />
                    </div>
                );
            },
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
                                Tambah User
                            </Link>
                        </Button>
                    )}
                </div>

                <DataTable columns={columns} data={displayUsers || []} />
            </div>
        </AppLayout>
    );
}
