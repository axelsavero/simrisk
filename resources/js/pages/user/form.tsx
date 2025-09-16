import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Unit {
    id: number;
    name: string;
    members: string[];
}

interface Pegawai {
    id: number;
    nama: string;
    unit_kerja: string;
    email?: string;
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
    [key: string]: string;
}

export default function Form({ allRoles, user = null }: FormProps) {
    const [units, setUnits] = useState<Unit[]>([]);
    const [availableNames, setAvailableNames] = useState<string[]>([]);
    const [loading, setLoading] = useState({ units: false, pegawai: false });
    const [apiError, setApiError] = useState<string>('');
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [allPegawai, setAllPegawai] = useState<Pegawai[]>([]);
    const [throttleUntil, setThrottleUntil] = useState<number>(0);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        unit_id: user?.unit_id?.toString() || '',
        unit: user?.unit?.toString() || '',
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: 'admin',
    });

    // Fungsi utilitas untuk panggilan API
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

        const url = `http://${window.location.host}/api/sipeg${endpoint}`;

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                if (response.status === 429) {
                    setThrottleUntil(Date.now() + 60 * 1000);
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

    // Fungsi utilitas untuk memproses data API
    const processApiData = (data: any): any[] => {
        console.log('Raw API response:', data); // Log untuk debugging
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.result && Array.isArray(data.result)) return data.result;
        if (data?.units && Array.isArray(data.units)) return data.units; // Menangani field "units"
        if (typeof data === 'object' && data !== null) {
            const arr = Object.values(data).find((v) => Array.isArray(v));
            return arr || [];
        }
        return [];
    };

    // Mengambil semua unit
    const fetchUnits = async () => {
        setLoading((prev) => ({ ...prev, units: true }));
        setApiError('');
        try {
            const result = await apiCall('/allunit');

            const unitsData = processApiData(result.data);
            if (!unitsData.length) {
                throw new Error('Tidak ada data unit yang ditemukan dari respons API. Periksa struktur data API SIPEG.');
            }

            const transformedUnits: Unit[] = unitsData
                .filter((apiUnit: any) => {
                    const name = apiUnit.ur_unit || apiUnit.nama_unit || apiUnit.name || apiUnit.unit_name;
                    return name && name.trim();
                })
                .map((apiUnit: any) => ({
                    id: apiUnit.id || apiUnit.id_homebase || apiUnit.kode_homebase || apiUnit.kode_unit || apiUnit.unit_id,
                    name: apiUnit.ur_unit || apiUnit.nama_unit || apiUnit.name || apiUnit.unit_name,
                    members: [],
                }));

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
                    { id: 1, name: 'Unit HRD (Dummy)', members: [] },
                    { id: 2, name: 'Unit IT (Dummy)', members: [] },
                ]);
                setApiError(`${errorMessage} (Menggunakan data dummy untuk pengembangan)`);
            } else {
                setUnits([]);
            }
        } finally {
            setLoading((prev) => ({ ...prev, units: false }));
        }
    };

    // Mengambil semua pegawai
    const fetchAllPegawai = async () => {
        try {
            const response = await fetch(`http://${window.location.host}/api/sipeg/pegawai`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            const data = await response.json();
            console.log('Pegawai API response:', data); // Log untuk debugging
            const pegawaiArr = processApiData(data);
            setAllPegawai(pegawaiArr);
            setUnits((prevUnits) =>
                prevUnits.map((unit) => ({
                    ...unit,
                    members: pegawaiArr
                        .filter((p: any) => {
                            const unitKerja = p.unit_kerja || p.unit || p.nama_unit || p.ur_unit;
                            return unitKerja && unitKerja.trim() === unit.name.trim();
                        })
                        .map((p: any) => p.nama || p.name),
                })),
            );
        } catch (error) {
            console.error('Error fetching pegawai:', error);
            setAllPegawai([]);
            setApiError(`❌ Gagal memuat daftar pegawai: ${error.message}`);
        }
    };

    // Mengambil pegawai berdasarkan unit
    const fetchPegawaiByUnit = async (unitName: string) => {
        setLoading((prev) => ({ ...prev, pegawai: true }));
        try {
            const encodedUnitName = encodeURIComponent(unitName);
            const result = await apiCall(`/unit/${encodedUnitName}`);

            const pegawaiData = processApiData(result.data);
            console.log(`Pegawai by unit (${unitName}) response:`, result.data); // Log untuk debugging
            const pegawaiNames = pegawaiData.map((pegawai: any) => pegawai.nama || pegawai.name || `Pegawai ${pegawai.id}`);
            setAvailableNames(pegawaiNames);
            setUnits((prevUnits) =>
                prevUnits.map((unit) =>
                    unit.name === unitName ? { ...unit, members: pegawaiNames } : unit,
                ),
            );
        } catch (error: any) {
            const errorMessage = error.message.includes('429')
                ? `❌ Terlalu banyak permintaan (HTTP 429). Tunggu beberapa saat.`
                : error.message.includes('404')
                ? `❌ Endpoint /unit/${unitName} tidak ditemukan. Silakan hubungi admin API SIPEG.`
                : `❌ Gagal memuat pegawai: ${error.message}`;
            setApiError(errorMessage);
            if (process.env.NODE_ENV === 'development') {
                const dummyNames = ['John Doe', 'Jane Smith'];
                setAvailableNames(dummyNames);
                setUnits((prevUnits) =>
                    prevUnits.map((unit) =>
                        unit.name === unitName ? { ...unit, members: dummyNames } : unit,
                    ),
                );
                setApiError(`${errorMessage} (Menggunakan data dummy untuk pengembangan)`);
            } else {
                setAvailableNames([]);
            }
        } finally {
            setLoading((prev) => ({ ...prev, pegawai: false }));
        }
    };

    // Tes koneksi API
    const testApiConnection = async () => {
        setApiStatus('testing');
        setApiError('');
        try {
            const result = await apiCall('/allunit');
            setApiStatus('success');
            setApiError('✅ Koneksi API berhasil');
            return result.success;
        } catch (error: any) {
            setApiStatus('error');
            const errorMessage = error.message.includes('404')
                ? `❌ Endpoint /allunit tidak ditemukan. Silakan hubungi admin API SIPEG.`
                : `❌ Koneksi API gagal: ${error.message}`;
            setApiError(errorMessage);
            return false;
        }
    };

    // Inisialisasi data
    useEffect(() => {
        fetchUnits();
        fetchAllPegawai();
    }, []);

    // Perbarui daftar nama pegawai saat unit berubah
    useEffect(() => {
        if (data.unit_id) {
            const selectedUnit = units.find((unit) => unit.id.toString() === data.unit_id);
            if (selectedUnit) {
                if (selectedUnit.members.length === 0) {
                    if (debounceTimeout) clearTimeout(debounceTimeout);
                    const timeout = setTimeout(() => fetchPegawaiByUnit(selectedUnit.name), 500);
                    setDebounceTimeout(timeout);
                } else {
                    setAvailableNames(selectedUnit.members);
                }
                if (!selectedUnit.members.includes(data.name)) {
                    setData('name', '');
                }
            }
        } else {
            setAvailableNames([]);
            setData('name', '');
        }
    }, [data.unit_id, units]);

    const handleSelectPegawai = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const pegawai = allPegawai.find((p) => p.id.toString() === selectedId);
        if (pegawai) {
            const unit = units.find((u) => {
                const unitKerja = pegawai.unit_kerja || pegawai.unit || pegawai.nama_unit || pegawai.ur_unit;
                return unitKerja && unitKerja === u.name;
            });
            if (unit) setData('unit_id', unit.id.toString());
            setData('name', pegawai.nama || pegawai.name);
            if (pegawai.email) setData('email', pegawai.email);
        }
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUnitId = e.target.value;
        const selectedUnit = units.find((unit) => unit.id.toString() === selectedUnitId);

        if (selectedUnit) {
            setData('unit_id', selectedUnitId);
            setData('unit', selectedUnit.name);
        } else {
            setData('unit_id', '');
            setData('unit', '');
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        {!apiError.startsWith('✅') && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-sm text-blue-600 underline hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                    onClick={testApiConnection}
                                    disabled={apiStatus === 'testing' || isThrottled}
                                >
                                    {apiStatus === 'testing' ? 'Menguji...' : 'Test Koneksi'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-sm text-red-600 underline hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                    onClick={fetchUnits}
                                    disabled={loading.units || isThrottled}
                                >
                                    {loading.units ? 'Memuat...' : 'Coba Lagi'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={submit} className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    <div>
                        <label className="mb-1 block font-medium">Unit</label>
                        <Select
                            options={units.map((unit) => ({ value: unit.id, label: unit.name }))}
                            value={units.find((unit) => unit.id.toString() === data.unit_id) ? { value: data.unit_id, label: units.find((unit) => unit.id.toString() === data.unit_id)?.name } : null}
                            onChange={(selected) => {
                                if (selected) {
                                    setData('unit_id', selected.value.toString());
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

                    <div>
                        <label className="mb-1 block font-medium">Nama Pegawai</label>
                        <Select
                            options={availableNames.map((nama) => ({ value: nama, label: nama }))}
                            value={data.name ? { value: data.name, label: data.name } : null}
                            onChange={(selected) => {
                                setData('name', selected ? selected.value : '');
                            }}
                            isLoading={!data.unit_id || loading.pegawai || isThrottled}
                            isDisabled={!data.unit_id || loading.pegawai || isThrottled}
                            placeholder="-- Pilih Pegawai --"
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
                            disabled={isThrottled}
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
                            disabled={isThrottled}
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Role</label>
                        <input
                            type='text'
                            value={data.role}
                            readOnly
                            disabled
                            className='w-full rounded-md border border-gray-300 p-2 bg-gray-100 cursor-not-allowed focus:outline-none' 
                            />
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
