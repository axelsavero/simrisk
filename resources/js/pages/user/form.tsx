import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface FormProps {
    allRoles: string[];
    user?: User | null;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    roles: string[];
}

export default function Form({ allRoles, user = null }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles?.map((role) => role.name) || [],
    });

    function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value, checked } = e.target;
        if (checked) {
            setData('roles', [...data.roles, value]);
        } else {
            setData(
                'roles',
                data.roles.filter((role) => role !== value),
            );
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(`/user/manage/${user.id}`);
        } else {
            post('/user/manage');
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen User', href: '/user/manage' },
        { title: user ? 'Edit User' : 'Tambah User', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user ? 'Edit User' : 'Tambah User Baru'} />
            <div className="w-full px-6 py-8">
                <h2 className="mb-6 text-2xl font-semibold">{user ? 'Edit User' : 'Tambah User Baru'}</h2>

                <form
                    onSubmit={submit}
                    className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900"
                >
                    <div>
                        <label className="mb-1 block font-medium">Nama</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                        />
                        {errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                        />
                        {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                        />
                        <small className="text-gray-500 dark:text-gray-400">
                            {user ? 'Kosongkan jika tidak ingin mengubah password.' : 'Minimal 8 karakter.'}
                        </small>
                        {errors.password && <div className="mt-1 text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">Roles</label>
                        <div className="space-y-1">
                            {allRoles.map((role) => (
                                <label className="flex items-center gap-2" key={role}>
                                    <input
                                        type="checkbox"
                                        value={role}
                                        checked={data.roles.includes(role)}
                                        onChange={handleCheckboxChange}
                                        className="form-check-input"
                                    />
                                    <span>{role}</span>
                                </label>
                            ))}
                        </div>
                        {errors.roles && <div className="mt-1 text-sm text-red-500">{errors.roles}</div>}
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md border border-green-600 px-6 py-2 text-green-600 transition hover:bg-green-600 hover:text-white"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link
                            href="/user/manage"
                            className="rounded-md border border-red-500 px-6 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
