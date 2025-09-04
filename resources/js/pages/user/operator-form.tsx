import React, { useEffect, useState } from 'react';
import { usePage, useForm, Link } from '@inertiajs/react';
import Select from 'react-select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';

export default function OperatorForm({ user = null }: { user?: any }) {
    const auth = (usePage().props as any)?.auth;
    const adminUnitName = auth.user?.unit;

    const [pegawaiUnit, setPegawaiUnit] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
    });

    // Ambil data pegawai dari API SIPEG proxy sesuai unit admin
    useEffect(() => {
        if (!adminUnitName) return;
        setLoading(true);
        fetch(`/api/sipegproxy/pegawai?unit_kerja=${encodeURIComponent(adminUnitName)}`)
            .then(res => res.json())
            .then(data => {
                setPegawaiUnit(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [adminUnitName]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(`/user/operator/${user.id}`);
        } else {
            post('/user/operator');
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Manajemen Operator', href: '/user/operator' },
            { title: user ? 'Edit User' : 'Tambah User', href: '#' },
        ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user ? 'Edit Operator' : 'Tambah Operator'} />
            <div className="w-full px-6 py-8">
                <h2 className="mb-6 text-2xl font-semibold">{user ? 'Edit Operator' : 'Tambah Operator'}</h2>
                <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    {/* Nama Operator */}
                    <div>
                        <label className="mb-1 block font-medium">Nama Operator</label>
                        <Select
                            options={pegawaiUnit.map((p: any) => ({
                                value: p.nama || p.name,
                                label: p.nama || p.name,
                                email: p.email,
                            }))}
                            value={data.name ? { value: data.name, label: data.name } : null}
                            onChange={(selected) => {
                                setData('name', selected?.value || '');
                                setData('email', selected?.email || '');
                            }}
                            placeholder={loading ? 'Memuat...' : '-- Pilih Operator --'}
                            isDisabled={loading}
                            classNamePrefix="react-select"
                        />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>
                    {/* Email */}
                    <div>
                        <label className="mb-1 block font-medium">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            readOnly
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>
                    {/* Password */}
                    <div>
                        <label className="mb-1 block font-medium">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : ''}
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>
                    <div className="mt-6 flex justify-between">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            variant="outline"
                        >
                            {user ? 'Simpan Perubahan' : 'Tambah Operator'}
                        </Button>
                        <Button asChild variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            <Link href="/user/operator">Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}