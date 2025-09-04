import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export default function OperatorForm({ user = null }: { user?: any }) {
    const auth = (usePage().props as any)?.auth;
    const currentUser = auth?.user || {};
    const adminUnitName = currentUser?.unit || '';

    // ambil role dari user yg login (bisa array objek atau string)
    const roles = currentUser?.roles || currentUser?.role;
    const isAdmin = Array.isArray(roles)
        ? roles.some((r: any) => (r?.name ? r.name === 'admin' : r === 'admin'))
        : roles === 'admin';

    const [pegawaiUnit, setPegawaiUnit] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string>('');

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
    });

    const processApiData = (d: any): any[] => {
        if (!d) return [];
        if (Array.isArray(d)) return d;
        if (d?.data && Array.isArray(d.data)) return d.data;
        if (d?.result && Array.isArray(d.result)) return d.result;
        if (d?.units && Array.isArray(d.units)) return d.units;
        const arr = Object.values(d).find((v) => Array.isArray(v));
        return arr || [];
    };

    // hanya lakukan fetch jika user adalah admin
    useEffect(() => {
        if (!isAdmin) return;
        if (!adminUnitName) {
            setApiError('Unit tidak ditemukan pada profil Anda. Hubungi administrator.');
            setPegawaiUnit([]);
            return;
        }

        setLoading(true);
        setApiError('');

        const url = `/api/sipegproxy/pegawai?unit_kerja=${encodeURIComponent(adminUnitName)}`;
        console.debug('Memanggil SIPEG proxy:', url);

        fetch(url)
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                const json = await res.json();
                console.debug('Respons SIPEG mentah:', json);

                const arr = processApiData(json);
                console.debug('Array hasil normalisasi SIPEG:', arr);

                const filtered = (arr || []).filter((p: any) => {
                    const unitKerja = (p.unit_kerja || p.unit || p.nama_unit || p.ur_unit || '').toString();
                    return unitKerja.trim() && unitKerja.trim() === adminUnitName.trim();
                });

                console.debug(`Ditemukan ${filtered.length} pegawai untuk unit "${adminUnitName}"`, filtered);

                setPegawaiUnit(filtered);

                if (!filtered.length) {
                    setApiError(`Tidak ada pegawai ditemukan untuk unit "${adminUnitName}".`);
                }
            })
            .catch((err: any) => {
                console.error('Fetch pegawai unit admin gagal:', err);
                setApiError(`Gagal memuat pegawai untuk unit "${adminUnitName}".`);
                setPegawaiUnit([]);
            })
            .finally(() => setLoading(false));
    }, [isAdmin, adminUnitName]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isAdmin) {
            // safety: jangan submit bila bukan admin
            setApiError('Akses ditolak: hanya admin yang dapat menambahkan operator.');
            return;
        }
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

    // jika bukan admin tampilkan pesan akses ditolak
    if (!isAdmin) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="w-full px-6 py-8">
                    <h2 className="mb-6 text-2xl font-semibold">Akses Ditolak</h2>
                    <div className="rounded-md border p-6 bg-white shadow">
                        <p className="mb-4">Halaman ini hanya dapat diakses oleh pengguna dengan peran <strong>admin</strong>.</p>
                        <p className="mb-4">Anda login sebagai: {currentUser?.name || '–'} ({Array.isArray(roles) ? roles.map((r:any)=> r?.name || r).join(', ') : roles})</p>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Kembali ke Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user ? 'Edit Operator' : 'Tambah Operator'} />
            <div className="w-full px-6 py-8">
                <h2 className="mb-6 text-2xl font-semibold">{user ? 'Edit Operator' : 'Tambah Operator'}</h2>
                <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    {/* Hanya field Nama, Email, Password — unit diambil dari user yang login */}
                    <div>
                        <label className="mb-1 block font-medium">Nama Operator</label>
                        <Select
                            options={pegawaiUnit.map((p: any) => ({
                                value: (p.nama || p.name || '').toString(),
                                label: p.nama || p.name || '(tanpa nama)',
                                email: p.email,
                            }))}
                            value={data.name ? { value: data.name, label: data.name } : null}
                            onChange={(selected: any) => {
                                setData('name', selected?.value || '');
                                if (selected?.email) setData('email', selected.email);
                            }}
                            placeholder={loading ? 'Memuat daftar pegawai...' : apiError ? apiError : '-- Pilih Operator --'}
                            isDisabled={loading || !adminUnitName}
                            classNamePrefix="react-select"
                        />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

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