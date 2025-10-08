import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Unit {
    id: number;
    name: string;
    original_id?: number;
}

interface Pegawai {
    id: number;
    nama: string;
    email: string;
    unit_kerja: string;
    homebase: string;
    unit_id?: number;
}

interface FormProps {
    allRoles: string[];
    user?: User | null;
}

interface FormData {
    unit_id: string;
    unit: string;
    name: string;
    email: string;
    password: string;
    role: string;
}

export default function AdminForm({ allRoles, user = null }: FormProps) {
    const [units, setUnits] = useState<Unit[]>([]);
    const [pegawaiUnit, setPegawaiUnit] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState({ units: false, pegawai: false });
    const [apiError, setApiError] = useState<string>('');
    const [throttleUntil, setThrottleUntil] = useState<number>(0);

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        unit_id: user?.unit_id?.toString() || '',
        unit: user?.unit?.toString() || '',
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.roles?.[0]?.name || 'admin',
    });

    // ... (sisa fungsi apiCall, processApiData, fetchUnits, fetchPegawaiByUnit tetap sama) ...

    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        if (Date.now() < throttleUntil) {
            const remainingSeconds = Math.ceil((throttleUntil - Date.now()) / 1000);
            throw new Error(`Terlalu banyak permintaan. Coba lagi dalam ${remainingSeconds} detik. (HTTP 429)`);
        }

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
                    setThrottleUntil(Date.now() + 60 * 1000);
                    throw new Error(`HTTP 429: Terlalu banyak permintaan.`);
                }
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(`HTTP 400: ${errorData.error || 'Bad Request'}`);
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

    const processApiData = (d: any): any[] => {
        console.debug('Raw API response:', d);
        if (!d) return [];
        if (Array.isArray(d)) return d;
        if (d?.data && Array.isArray(d.data)) return d.data;
        if (d?.pegawais && Array.isArray(d.pegawais)) return d.pegawais;
        if (d?.result && Array.isArray(d.result)) return d.result;
        if (d?.units && Array.isArray(d.units)) return d.units;
        const arr = Object.values(d).find((v) => Array.isArray(v));
        return arr || [];
    };

    const fetchUnits = async () => {
        setLoading((prev) => ({ ...prev, units: true }));
        setApiError('');

        try {
            const result = await apiCall('/allunit');
            const unitsData = processApiData(result.data);

            if (!unitsData.length) {
                throw new Error('Tidak ada data unit dari API SIPEG.');
            }

            const transformedUnits: Unit[] = unitsData
                .filter((unit: any) => {
                    const id = parseInt(unit.id || unit.id_homebase || unit.kode_homebase || unit.kode_unit || unit.unit_id);
                    const name = unit.nama_unit || unit.ur_unit || unit.name || unit.unit_name;
                    return !isNaN(id) && name && name.trim();
                })
                .map((unit: any) => {
                    const originalId = parseInt(unit.id || unit.id_homebase || unit.kode_homebase || unit.kode_unit || unit.unit_id);
                    return {
                        id: originalId,
                        name: unit.nama_unit || unit.ur_unit || unit.name || unit.unit_name,
                        original_id: originalId,
                    };
                });

            setUnits(transformedUnits);
            setApiError(`✅ ${transformedUnits.length} unit berhasil dimuat.`);
            setTimeout(() => setApiError(''), 5000);
        } catch (error: any) {
            const errorMessage = error.message.includes('429')
                ? `❌ Terlalu banyak permintaan (HTTP 429). Tunggu beberapa saat.`
                : error.message.includes('404')
                  ? `❌ Endpoint /allunit tidak ditemukan. Silakan hubungi admin API SIPEG.`
                  : `❌ Gagal memuat unit: ${error.message}`;
            setApiError(errorMessage);
            if (process.env.NODE_ENV === 'development') {
                setUnits([
                    { id: 1, name: 'Subdit Sumber Daya Manusia', original_id: 1 },
                    { id: 2, name: 'Kantor Tata Usaha, Layanan Umum, dan Rumah Tangga', original_id: 2 },
                ]);
                setApiError(`${errorMessage} (Menggunakan data dummy untuk pengembangan)`);
            } else {
                setUnits([]);
            }
        } finally {
            setLoading((prev) => ({ ...prev, units: false }));
        }
    };

    const fetchPegawaiByUnit = async (unitName: string) => {
        if (!unitName?.trim()) {
            setApiError('Unit tidak valid. Pilih unit terlebih dahulu.');
            setPegawaiUnit([]);
            return;
        }

        setLoading((prev) => ({ ...prev, pegawai: true }));
        setApiError('');

        const encodedUnitName = encodeURIComponent(unitName);
        try {
            const result = await apiCall(`/pegawai?unit_kerja=${encodedUnitName}`);

            const pegawaiData = processApiData(result.data);

            const filtered = pegawaiData
                .filter((p: any) => {
                    const unitKerja = (p.unit_kerja || p.homebase || '').toString().trim().toLowerCase();
                    return unitKerja && unitKerja === unitName.trim().toLowerCase();
                })
                .map((p: any) => {
                    const unitId = units.find((u) => u.name.toLowerCase() === unitName.toLowerCase())?.id;
                    return {
                        id: p.id,
                        nama: p.nama || p.name || `Pegawai ${p.id}`,
                        email: p.email || '',
                        unit_kerja: p.unit_kerja || p.homebase || '',
                        homebase: p.homebase || p.unit_kerja || '',
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
            ? `❌ Terlalu banyak permintaan (HTTP 429). Tunggu beberapa saat.`
            : error.message.includes('400')
            ? `❌ ${error.message}`
            : error.message.includes('404')
                ? `❌ Endpoint /pegawai?unit_kerja=${encodedUnitName} tidak ditemukan. Silakan hubungi admin API SIPEG.`
                : `❌ Gagal memuat pegawai: ${error.message}`;
            setApiError(errorMessage);
            if (process.env.NODE_ENV === 'development') {
                const dummyPegawai = [
                    { id: 1, nama: 'John Doe', email: 'john@example.com', unit_kerja: unitName, homebase: unitName, unit_id: 1 },
                    { id: 2, nama: 'Jane Smith', email: 'jane@example.com', unit_kerja: unitName, homebase: unitName, unit_id: 1 },
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
        fetchUnits();
    }, []);

    useEffect(() => {
        if (data.unit) {
            fetchPegawaiByUnit(data.unit);
            setData('name', '');
            setData('email', '');
        } else {
            setPegawaiUnit([]);
            setData('name', '');
            setData('email', '');
        }
    }, [data.unit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(''); // Bersihkan error sebelumnya

        // Validasi 1: Kelengkapan data
        if (!data.name || !data.email || !data.unit_id) {
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
            put(`/user/manage/${user.id}`);
        } else {
            post('/user/manage');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen User', href: '/user/manage' },
        { title: user ? 'Edit User' : 'Tambah User', href: '#' },
    ];

    const isThrottled = Date.now() < throttleUntil;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user ? 'Edit User' : 'Tambah User Baru'} />
            <div className="w-full px-6 py-8">
                <h2 className="mb-6 text-2xl font-semibold">{user ? 'Edit User' : 'Tambah User Baru'}</h2>

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
                            isLoading={loading.units || isThrottled}
                            isDisabled={loading.units || isThrottled}
                            placeholder="-- Pilih Unit --"
                            classNamePrefix="react-select"
                        />
                        {errors.unit_id && <div className="text-sm text-red-500">{errors.unit_id}</div>}
                    </div>


                    {/* ... Select untuk Nama Pegawai ... */}
                     <div>
                        <label className="mb-1 block font-medium">Nama Pegawai</label>
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
                            isLoading={!data.unit || loading.pegawai || isThrottled}
                            isDisabled={!data.unit || loading.pegawai || isThrottled}
                            placeholder={loading.pegawai ? 'Memuat daftar pegawai...' : !data.unit ? 'Pilih unit terlebih dahulu' : '-- Pilih Pegawai --'}
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
                            disabled={isThrottled}
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Role</label>
                        <Select
                            options={[{ value: 'admin', label: 'admin' }, { value: 'super-admin', label: 'super-admin' }]}
                            value={{ value: data.role, label: data.role }}
                            onChange={(selected) => selected && setData('role', selected.value)}
                            isDisabled={false}
                            placeholder="-- Pilih Role --"
                        />
                        {errors.role && <div className="text-sm text-red-500">{errors.role}</div>}
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Button
                            type="submit"
                            disabled={processing || loading.units || loading.pegawai || isThrottled}
                            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            variant="outline"
                        >
                            {user ? 'Simpan Perubahan' : 'Tambah User'}
                        </Button>
                        <Button asChild variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            <Link href="/user/manage">Batal</Link>
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
