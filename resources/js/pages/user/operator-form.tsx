import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Unit {
    id: number;
    name: string;
}

interface Pegawai {
    id: number;
    nama: string;
    email: string;
    unit: string;
    homebase: string;
    unit_id?: number;
}

export default function OperatorForm({ user = null }: { user?: any }) {
    const { props } = usePage();
    const auth = props.auth || {};
    const currentUser = auth.user || {};
    const roles = currentUser?.roles || currentUser?.role;
    const isAdmin = Array.isArray(roles)
        ? roles.some((r: any) => (r?.name ? r.name === 'admin' : r === 'admin'))
        : roles === 'admin';

    const [units, setUnits] = useState<Unit[]>(currentUser?.unit_id && currentUser?.unit ? [{ id: currentUser.unit_id, name: currentUser.unit }] : []);
    const [pegawaiUnit, setPegawaiUnit] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState({ units: false, pegawai: false });
    const [apiError, setApiError] = useState<string>('');

    const { data, setData, post, put, processing, errors } = useForm({
        unit_id: user?.unit_id?.toString() || (currentUser?.unit_id?.toString() || ''),
        unit: user?.unit || currentUser?.unit || '',
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: 'owner-risk',
    });

    // ... (sisa fungsi apiCall dan fetchPegawaiByUnit tetap sama) ...

    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        const defaultOptions: RequestInit = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            ...options,
        };

        const url = `/api/sipegproxy${endpoint}`;

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(`HTTP 429: Terlalu banyak permintaan.`);
                }
                if (response.status === 404) {
                    throw new Error(`HTTP 404: Endpoint ${endpoint} tidak ditemukan. Silakan hubungi admin API SIPEG.`);
                }
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            return { success: true, data: await response.json(), url };
        } catch (error) {
            console.error(`Gagal memanggil ${url}:`, error);
            throw error;
        }
    };

    const fetchPegawaiByUnit = async (unitName: string) => {
        setLoading((prev) => ({ ...prev, pegawai: true }));
        setApiError('');

        try {
            const encodedUnitName = encodeURIComponent(unitName);
            const result = await apiCall(`/pegawai?unit_kerja=${encodedUnitName}`);

            const pegawaiData = result.data?.data || result.data || [];

            const filtered = pegawaiData
                .filter((p: any) => {
                    const unitField = (p.unit || p.homebase || '').toString().trim().toLowerCase();
                    return unitField && unitField === unitName.trim().toLowerCase();
                })
                .map((p: any) => {
                    const unitId = units.find((u) => u.name.toLowerCase() === unitName.toLowerCase())?.id;
                    return {
                        id: p.id,
                        nama: p.nama || p.name || `Pegawai ${p.id}`,
                        email: p.email || '',
                        unit: p.unit || p.homebase || '',
                        homebase: p.homebase || p.unit || '',
                        unit_id: unitId || null,
                    };
                });

            setPegawaiUnit(filtered);

            if (!filtered.length) {
                setApiError(`Tidak ada pegawai ditemukan untuk unit "${unitName}".`);
            } else {
                setApiError(`✅ ${filtered.length} pegawai ditemukan untuk unit "${unitName}".`);
                setTimeout(() => setApiError(''), 5000);
            }
        } catch (error: any) {
            const errorMessage = error.message.includes('429')
                ? `❌ Terlalu banyak permintaan (HTTP 429).`
                : error.message.includes('404')
                ? `❌ Endpoint /pegawai?unit_kerja=${unitName} tidak ditemukan. Silakan hubungi admin API SIPEG.`
                : `❌ Gagal memuat pegawai: ${error.message}`;
            setApiError(errorMessage);
            if (process.env.NODE_ENV === 'development') {
                const dummyPegawai = [
                    { id: 1, nama: 'John Doe', email: 'john@example.com', unit: unitName, homebase: unitName, unit_id: 1 },
                    { id: 2, nama: 'Jane Smith', email: 'jane@example.com', unit: unitName, homebase: unitName, unit_id: 1 },
                ];
                setPegawaiUnit(dummyPegawai);
                setApiError(`${errorMessage} (Menggunakan data dummy untuk pengembangan)`);
            } else {
                setPegawaiUnit([]);
            }
        } finally {
            setLoading((prev) => ({ ...prev, pegawai: false }));
        }
    };

    useEffect(() => {
        if (!isAdmin) return;
        if (!currentUser?.unit_id || !currentUser?.unit) {
            setApiError('Unit dari akun admin tidak ditemukan. Silakan hubungi administrator.');
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!data.unit) {
            setPegawaiUnit([]);
            setData('name', '');
            setData('email', '');
            return;
        }
        fetchPegawaiByUnit(data.unit);
    }, [data.unit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(''); // Bersihkan error sebelumnya

        if (!isAdmin) {
            setApiError('Akses ditolak: hanya admin yang dapat menambahkan operator.');
            return;
        }

        // Validasi 1: Kelengkapan data
        if (!data.unit_id || !data.unit || !data.name || !data.email) {
            setApiError('❌ Unit, nama, dan email harus diisi.');
            return;
        }

        // Validasi 2: Domain email
        if (!data.email.endsWith('@unj.ac.id')) {
            setApiError('❌ Domain email harus @unj.ac.id');
            return;
        }

        // Jika lolos validasi, lanjutkan submit
        if (user) {
            put(`/user/operator/${user.id}`);
        } else {
            post('/user/operator');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Operator', href: '/user/operator' },
        { title: user ? 'Edit Operator' : 'Tambah Operator', href: '#' },
    ];

    // ... (sisa return statement untuk non-admin tetap sama) ...
    if (!isAdmin) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Akses Ditolak" />
                <div className="w-full px-6 py-8">
                    <h2 className="mb-6 text-2xl font-semibold">Akses Ditolak</h2>
                    <div className="rounded-md border p-6 bg-white shadow">
                        <p className="mb-4">Halaman ini hanya dapat diakses oleh pengguna dengan peran <strong>admin</strong>.</p>
                        <p className="mb-4">Anda login sebagai: {currentUser?.name || '–'} ({Array.isArray(roles) ? roles.map((r: any) => r?.name || r).join(', ') : roles})</p>
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

                {apiError && (
                    <div
                        className={`mb-4 flex items-center justify-between rounded-md border p-4 ${
                            apiError.startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                    >
                        <span className={apiError.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>{apiError}</span>
                        {/* ... tombol coba lagi ... */}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    {/* ... Select untuk Unit ... */}
                     <div>
                        <label className="mb-1 block font-medium">Unit</label>
                        <Select
                            options={units.map((unit) => ({ value: unit.id.toString(), label: unit.name }))}
                            value={
                                data.unit_id
                                    ? { value: data.unit_id, label: units.find((unit) => unit.id.toString() === data.unit_id)?.name || '' }
                                    : null
                            }
                            onChange={(selected) => {
                                if (selected) {
                                    setData('unit_id', selected.value);
                                    setData('unit', selected.label);
                                } else {
                                    setData('unit_id', '');
                                    setData('unit', '');
                                }
                            }}
                            isDisabled={true}
                            placeholder={units.length > 0 ? units[0].name : '-- Unit Tidak Tersedia --'}
                            classNamePrefix="react-select"
                        />
                        {errors.unit_id && <div className="text-sm text-red-500">{errors.unit_id}</div>}
                    </div>

                    {/* ... Select untuk Nama Operator ... */}
                    <div>
                        <label className="mb-1 block font-medium">Nama Operator</label>
                        <Select
                            options={pegawaiUnit.map((p) => ({
                                value: p.nama,
                                label: p.nama,
                                email: p.email,
                                unit_id: p.unit_id,
                            }))}
                            value={data.name ? { value: data.name, label: data.name, email: data.email, unit_id: data.unit_id } : null}
                            onChange={(selected) => {
                                if (selected) {
                                    setData('name', selected.value || '');
                                    setData('email', selected.email || '');
                                    setData('unit_id', selected.unit_id?.toString() || data.unit_id);
                                } else {
                                    setData('name', '');
                                    setData('email', '');
                                }
                            }}
                            isLoading={!data.unit || loading.pegawai}
                            isDisabled={!data.unit || loading.pegawai}
                            placeholder={loading.pegawai ? 'Memuat daftar pegawai...' : !data.unit ? 'Pilih unit terlebih dahulu' : '-- Pilih Operator --'}
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
                            // Properti readOnly dihapus
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    {/* ... Sisa form (Password, Role, Buttons) ... */}
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

                    <div>
                        <label className="mb-1 block font-medium">Role</label>
                        <input
                            type="text"
                            value={data.role}
                            readOnly
                            disabled
                            className="w-full rounded-md border border-gray-300 p-2 bg-gray-100 cursor-not-allowed focus:outline-none"
                        />
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
