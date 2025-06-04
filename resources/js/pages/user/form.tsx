// resources/js/Pages/User/Form.tsx

import { useForm, Head, Link } from '@inertiajs/react';
import { User, BreadcrumbItem } from '@/types';
import React from 'react';
import AppLayout from '@/layouts/app-layout';

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
        roles: user?.roles?.map(role => role.name) || [],
    });

    function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value, checked } = e.target;
        if (checked) {
            setData('roles', [...data.roles, value]);
        } else {
            setData('roles', data.roles.filter((role) => role !== value));
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
            <div className="max-w-2xl mx-auto p-4 space-y-6">
                <h2 className="text-2xl font-semibold">
                    {user ? 'Edit User' : 'Tambah User Baru'}
                </h2>
                <form
                onSubmit={submit}
                className="space-y-4 border-2 border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md"
>

                    <div>
                        <label className="block mb-1 font-medium">Nama</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <small className="text-black">
                            {user ? 'Kosongkan jika tidak ingin mengubah password.' : 'Minimal 8 karakter.'}
                        </small>
                        {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Roles</label>
                        <div className="space-y-1">
                            {allRoles.map(role => (
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
                        {errors.roles && <div className="text-danger mt-1">{errors.roles}</div>}
                    </div>

                   <div className="flex justify-between mt-6">
                    {/* Tombol Simpan di kiri */}
                    <button
                     type="submit"
                    disabled={processing}
                    className="px-6 py-2 border border-black text-black rounded-md hover:bg-green-600 hover:text-white transition"
                     >
                        {processing ? 'Menyimpan...' : 'Simpan'}
                     </button>

                     {/* Tombol Batal di kanan */}
                     <Link
                     href="/user/manage"
                         className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-600 hover:text-white dark:text-gray-300 dark:border-gray-600 dark:hover:bg-neutral-800 transition"
                      >
                           Batal
                    </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
