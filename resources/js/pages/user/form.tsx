import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

// ... (Interface Unit, Pegawai, ApiUnit, ApiPegawai, FormProps, FormData tidak berubah) ...
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

interface ApiUnit {
    id: number;
    nama_unit: string;
    kode_unit?: string;
}

interface ApiPegawai {
    id: number;
    nama: string;
    nip?: string;
    email?: string;
    unit_id?: number;
    unit_name?: string;
}

interface FormProps {
    allRoles: string[];
    user?: User | null;
}

interface FormData {
    unit_id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    [key: string]: string; // Add index signature
}

export default function Form({ allRoles, user = null }: FormProps) {
    const [units, setUnits] = useState<Unit[]>([]);
    const [availableNames, setAvailableNames] = useState<string[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [loadingPegawai, setLoadingPegawai] = useState(false);
    const [apiError, setApiError] = useState<string>('');
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [allPegawai, setAllPegawai] = useState<Pegawai[]>([]);
    // --- PERBAIKAN: Throttle global untuk menangani error 429 ---
    const [throttleUntil, setThrottleUntil] = useState<number>(0);
    const [pegawaiDebounceTimeout, setPegawaiDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        unit_id: user?.unit_id?.toString() || '',
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.roles?.[0]?.name || '',
    });

    // --- PERBAIKAN: Gabungkan fetch data awal ke dalam satu useEffect ---
    useEffect(() => {
        // Fetch all units on mount
        fetchUnits();

        // Fetch all pegawai for mapping ke unit
        fetch('/proxy/sipeg/api/pegawai')
            .then((res) => res.json())
            .then((data) => {
                let pegawaiArr = [];
                if (Array.isArray(data)) {
                    pegawaiArr = data;
                } else if (data && Array.isArray(data.data)) {
                    pegawaiArr = data.data;
                }
                setAllPegawai(pegawaiArr);

                // Mapping pegawai ke unit jika units sudah ada
                setUnits((prevUnits) =>
                    prevUnits.map((unit) => ({
                        ...unit,
                        members: pegawaiArr.filter((p: any) => p.unit_kerja && p.unit_kerja.trim() === unit.name.trim()).map((p: any) => p.nama),
                    })),
                );
            })
            .catch(() => setAllPegawai([]));
    }, []);

    // Improved API call function
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        // --- PERBAIKAN: Cek throttle sebelum melakukan panggilan API ---
        if (Date.now() < throttleUntil) {
            const remainingSeconds = Math.ceil((throttleUntil - Date.now()) / 1000);
            throw new Error(`Terlalu banyak permintaan. Coba lagi dalam ${remainingSeconds} detik. (HTTP 429)`);
        }

        const defaultOptions: RequestInit = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            ...options,
        };

        const url = `/proxy/sipeg/api${endpoint}`;

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                // --- PERBAIKAN: Set throttle jika menerima error 429 ---
                if (response.status === 429) {
                    setThrottleUntil(Date.now() + 60 * 1000); // Throttle selama 1 menit
                }
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data, url };
        } catch (error) {
            console.error(`Failed to call ${url}:`, error);
            throw error;
        }
    };

    // Test API connection
    const testApiConnection = async () => {
        setApiStatus('testing');
        setApiError('');
        try {
            const result = await apiCall('/allunit');
            if (result.success) {
                setApiStatus('success');
                setApiError('✅ Koneksi API berhasil');
                return true;
            } else {
                throw new Error('API test failed');
            }
        } catch (error) {
            setApiStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setApiError(`❌ Koneksi API gagal: ${errorMessage}`);
            return false;
        }
    };

    // Fetch units dari API
    const fetchUnits = async () => {
        setLoadingUnits(true);
        setApiError('');
        try {
            // Ganti endpoint ke /allhomebase
            const result = await apiCall('/allhomebase');

            if (!result.success) {
                throw new Error('Gagal memuat unit');
            }

            let unitsData: any[] = [];
            if (Array.isArray(result.data)) {
                unitsData = result.data;
            } else if (result.data?.data && Array.isArray(result.data.data)) {
                unitsData = result.data.data;
            } else if (result.data?.result && Array.isArray(result.data.result)) {
                unitsData = result.data.result;
            } else if (typeof result.data === 'object' && result.data !== null) {
                const arr = Object.values(result.data).find((v) => Array.isArray(v));
                if (arr) unitsData = arr as any[];
            }

            if (!unitsData || unitsData.length === 0) {
                throw new Error('Tidak ada data unit yang ditemukan dari respons API');
            }

            // Gunakan ur_homebase sebagai nama unit
            const transformedUnits: Unit[] = unitsData
                .filter((apiUnit: any) => apiUnit.ur_homebase && apiUnit.ur_homebase.trim() !== '')
                .map((apiUnit: any) => ({
                    id: apiUnit.id || apiUnit.id_homebase || apiUnit.kode_homebase || apiUnit.kode_unit,
                    name: apiUnit.ur_homebase,
                    members: [], // akan diisi setelah fetch pegawai
                }));

            setUnits(transformedUnits);
            setApiError(`✅ ${transformedUnits.length} unit berhasil dimuat dari API SIPEG.`);
            setTimeout(() => setApiError(''), 5000);
        } catch (error: any) {
            console.error('Error fetching units:', error);
            let errorMessage = 'Gagal memuat data unit dari API SIPEG. ';
            if (error.message.includes('429')) {
                errorMessage = `❌ Gagal: Terlalu banyak permintaan ke SIPEG (HTTP 429). Silakan tunggu beberapa saat sebelum mencoba lagi.`;
            } else {
                errorMessage += `Detail: ${error.message}`;
            }
            setApiError(errorMessage);
            // Fallback dummy hanya untuk development
            if (process.env.NODE_ENV === 'development') {
                setUnits([
                    { id: 1, name: 'Unit HRD (Dummy)', members: [] },
                    { id: 2, name: 'Unit IT (Dummy)', members: [] },
                ]);
            } else {
                setUnits([]);
            }
        } finally {
            setLoadingUnits(false);
        }
    };

    // Fetch pegawai per unit
    const fetchPegawaiByUnit = async (unitName: string) => {
        setLoadingPegawai(true);
        try {
            const encodedUnitName = encodeURIComponent(unitName);
            const result = await apiCall(`/unit/${encodedUnitName}`);

            if (!result.success) {
                throw new Error('Gagal memuat pegawai');
            }

            let pegawaiData: ApiPegawai[] = [];
            if (result.data.success && result.data.data) {
                pegawaiData = Array.isArray(result.data.data) ? result.data.data : [];
            } else if (Array.isArray(result.data)) {
                pegawaiData = result.data;
            }

            const pegawaiNames = pegawaiData.map((pegawai: ApiPegawai) => pegawai.nama || `Pegawai ${pegawai.id}`);
            setAvailableNames(pegawaiNames);
            setUnits((prevUnits) => prevUnits.map((unit) => (unit.name === unitName ? { ...unit, members: pegawaiNames } : unit)));
        } catch (error: any) {
            console.error('Error fetching pegawai:', error);
            let errorMessage = 'Gagal memuat data pegawai dari API SIPEG. ';
            if (error.message.includes('429')) {
                errorMessage = `❌ Gagal: Terlalu banyak permintaan ke SIPEG (HTTP 429). Silakan tunggu beberapa saat.`;
            } else {
                errorMessage += `Detail: ${error.message}`;
            }
            setApiError(errorMessage);

            // Fallback dummy hanya untuk development
            if (process.env.NODE_ENV === 'development') {
                const dummyNames = ['John Doe', 'Jane Smith'];
                setAvailableNames(dummyNames);
                setUnits((prevUnits) => prevUnits.map((unit) => (unit.name === unitName ? { ...unit, members: dummyNames } : unit)));
            } else {
                setAvailableNames([]);
            }
        } finally {
            setLoadingPegawai(false);
        }
    };

    // Debounced fetchPegawaiByUnit
    const debouncedFetchPegawaiByUnit = (unitName: string) => {
        if (pegawaiDebounceTimeout) clearTimeout(pegawaiDebounceTimeout);
        const timeout = setTimeout(() => {
            fetchPegawaiByUnit(unitName);
        }, 500); // 500ms debounce
        setPegawaiDebounceTimeout(timeout);
    };

    // Update available names ketika unit berubah
    useEffect(() => {
        if (data.unit_id) {
            const selectedUnit = units.find((unit) => unit.id.toString() === data.unit_id);
            // --- PERBAIKAN: Pastikan selectedUnit ada ---
            if (selectedUnit) {
                if (selectedUnit.members.length === 0) {
                    debouncedFetchPegawaiByUnit(selectedUnit.name);
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
            const unit = units.find((u) => u.name === pegawai.unit_kerja);
            if (unit) {
                setData('unit_id', unit.id.toString());
            }
            setData('name', pegawai.nama);
            if (pegawai.email) setData('email', pegawai.email);
        }
    };

    function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setData('unit_id', e.target.value);
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
                                <button
                                    onClick={testApiConnection}
                                    className="text-sm text-blue-600 underline hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                    disabled={apiStatus === 'testing' || isThrottled}
                                >
                                    {apiStatus === 'testing' ? 'Menguji...' : 'Test Koneksi'}
                                </button>
                                {/* --- PERBAIKAN: Nonaktifkan tombol saat throttle --- */}
                                <button
                                    onClick={fetchUnits}
                                    className="text-sm text-red-600 underline hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                    disabled={loadingUnits || isThrottled}
                                >
                                    {loadingUnits ? 'Memuat...' : 'Coba Lagi'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ... (Debug Info tidak berubah) ... */}

                <form onSubmit={submit} className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    {/* ... (Dropdown Unit, Nama Pegawai, Email, Password, Role tidak berubah, tapi properti `disabled` akan terpengaruh `isThrottled`) ... */}
                    <div>
                        <label className="mb-1 block font-medium">Unit</label>
                        <select
                            value={data.unit_id}
                            onChange={handleUnitChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={loadingUnits || isThrottled}
                        >
                            <option value="">-- Pilih Unit --</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                        {errors.unit_id && <div className="text-sm text-red-500">{errors.unit_id}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Nama Pegawai</label>
                        <select
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={!data.unit_id || loadingPegawai || isThrottled}
                        >
                            <option value="">-- Pilih Pegawai --</option>
                            {availableNames.map((nama, idx) => (
                                <option key={idx} value={nama}>
                                    {nama}
                                </option>
                            ))}
                        </select>
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    {/* ... (Sisa form) ... */}

                    {/* Form Actions */}
                    <div className="mt-6 flex justify-between">
                        <button
                            type="submit"
                            disabled={processing || loadingUnits || loadingPegawai || isThrottled}
                            className="rounded-md border border-green-600 px-6 py-2 text-green-600 transition hover:bg-green-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {user ? 'Simpan Perubahan' : 'Tambah User'}
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
