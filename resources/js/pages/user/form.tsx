import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

interface Unit {
    id: number;
    name: string;
    members: string[];
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
}

export default function Form({ allRoles, user = null }: FormProps) {
    const [units, setUnits] = useState<Unit[]>([]);
    const [availableNames, setAvailableNames] = useState<string[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [loadingPegawai, setLoadingPegawai] = useState(false);
    const [apiError, setApiError] = useState<string>('');
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        unit_id: user?.unit_id?.toString() || '',
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.roles?.[0]?.name || '',
    });

    // Improved API call function
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        const defaultOptions: RequestInit = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            ...options,
        };

        // Use Laravel proxy endpoint only
        const url = /api/proxy${endpoint};

        try {
            console.log(Making API call to: ${url});

            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(HTTP ${response.status}: ${errorText});
            }

            const data = await response.json();
            console.log(Success response from ${url}:, data);

            return { success: true, data, url };

        } catch (error) {
            console.error(Failed to call ${url}:, error);
            throw error;
        }
    };

    // Test API connection
    const testApiConnection = async () => {
        setApiStatus('testing');
        setApiError('');

        try {
            const result = await apiCall('/test');

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
            setApiError(❌ Koneksi API gagal: ${errorMessage});
            return false;
        }
    };

    // Fetch units dari API
    const fetchUnits = async () => {
        setLoadingUnits(true);
        setApiError('');

        try {
            // Test connection first
            const connectionOk = await testApiConnection();
            if (!connectionOk) {
                throw new Error('API connection test failed');
            }

            const result = await apiCall('/allunit');

            if (!result.success) {
                throw new Error('Failed to fetch units');
            }

            let unitsData: ApiUnit[] = [];

            // Handle different response structures
            if (result.data.success && result.data.data) {
                // Response: { success: true, data: [...] }
                unitsData = Array.isArray(result.data.data) ? result.data.data : [];
            } else if (Array.isArray(result.data)) {
                // Response: [...]
                unitsData = result.data;
            } else {
                throw new Error('Invalid response structure');
            }

            console.log('Units data received:', unitsData);

            if (unitsData.length === 0) {
                throw new Error('No units found in API response');
            }

            // Transform data units
            const transformedUnits: Unit[] = unitsData.map((apiUnit: ApiUnit) => ({
                id: apiUnit.id,
                name: apiUnit.nama_unit || Unit ${apiUnit.id},
                members: [],
            }));

            setUnits(transformedUnits);
            setApiError(✅ ${transformedUnits.length} unit berhasil dimuat dari API SIPEG);
            setTimeout(() => setApiError(''), 5000);

        } catch (error) {
            console.error('Error fetching units:', error);

            let errorMessage = 'Gagal memuat data unit dari API SIPEG. ';

            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage += 'Masalah koneksi network.';
            } else if (error instanceof Error) {
                errorMessage += Error: ${error.message};
            }

            setApiError(errorMessage);

            // Fallback ke data dummy untuk development
            setUnits([
                { id: 1, name: 'Unit HRD (Dummy)', members: [] },
                { id: 2, name: 'Unit IT (Dummy)', members: [] },
                { id: 3, name: 'Unit Finance (Dummy)', members: [] },
            ]);
        } finally {
            setLoadingUnits(false);
        }
    };

    // Fetch pegawai per unit
    const fetchPegawaiByUnit = async (unitName: string) => {
        setLoadingPegawai(true);

        try {
            const encodedUnitName = encodeURIComponent(unitName);
            const result = await apiCall(/unit/${encodedUnitName});

            if (!result.success) {
                throw new Error('Failed to fetch pegawai');
            }

            let pegawaiData: ApiPegawai[] = [];

            // Handle different response structures
            if (result.data.success && result.data.data) {
                pegawaiData = Array.isArray(result.data.data) ? result.data.data : [];
            } else if (Array.isArray(result.data)) {
                pegawaiData = result.data;
            }

            console.log('Pegawai data received:', pegawaiData);

            // Extract nama pegawai
            const pegawaiNames = pegawaiData.map((pegawai: ApiPegawai) =>
                pegawai.nama || Pegawai ${pegawai.id}
            );

            setAvailableNames(pegawaiNames);

            // Update unit dengan member data
            setUnits(prevUnits =>
                prevUnits.map(unit =>
                    unit.name === unitName
                        ? { ...unit, members: pegawaiNames }
                        : unit
                )
            );

        } catch (error) {
            console.error('Error fetching pegawai:', error);

            // Fallback ke data dummy
            const dummyNames = ['John Doe', 'Jane Smith', 'Bob Johnson'];
            setAvailableNames(dummyNames);

            setUnits(prevUnits =>
                prevUnits.map(unit =>
                    unit.name === unitName
                        ? { ...unit, members: dummyNames }
                        : unit
                )
            );
        } finally {
            setLoadingPegawai(false);
        }
    };

    // Load units saat component mount
    useEffect(() => {
        fetchUnits();
    }, []);

    // Update available names ketika unit berubah
    useEffect(() => {
        if (data.unit_id) {
            const selectedUnit = units.find(unit => unit.id.toString() === data.unit_id);
            if (selectedUnit) {
                if (selectedUnit.members.length === 0) {
                    fetchPegawaiByUnit(selectedUnit.name);
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

    function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setData('unit_id', e.target.value);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(/user/manage/${user.id});
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

                {/* API Status */}
                {apiError && (
                    <div className={`mb-4 flex items-center justify-between rounded-md border p-4 ${
                        apiError.startsWith('✅')
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <span className={apiError.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                            {apiError}
                        </span>
                        {!apiError.startsWith('✅') && (
                            <div className="flex gap-2">
                                <button
                                    onClick={testApiConnection}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    disabled={apiStatus === 'testing'}
                                >
                                    {apiStatus === 'testing' ? 'Testing...' : 'Test Koneksi'}
                                </button>
                                <button
                                    onClick={fetchUnits}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                    disabled={loadingUnits}
                                >
                                    {loadingUnits ? 'Memuat...' : 'Coba Lagi'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-4 bg-gray-100 rounded-md text-sm">
                        <strong>Debug Info:</strong><br />
                        API Status: {apiStatus}<br />
                        Loading Units: {loadingUnits ? 'true' : 'false'}<br />
                        Loading Pegawai: {loadingPegawai ? 'true' : 'false'}<br />
                        Units Count: {units.length}<br />
                        Available Names: {availableNames.length}<br />
                        Selected Unit ID: {data.unit_id || 'none'}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md"
                >
                    {/* Unit Selection */}
                    <div>
                        <label className="mb-1 block font-medium">Unit</label>
                        <select
                            value={data.unit_id}
                            onChange={handleUnitChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={loadingUnits}
                        >
                            <option value="">
                                {loadingUnits ? 'Memuat unit...' : 'Pilih Unit'}
                            </option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                    {unit.members.length > 0 && ` (${unit.members.length} pegawai)`}
                                </option>
                            ))}
                        </select>
                        {errors.unit_id && <div className="mt-1 text-sm text-red-500">{errors.unit_id}</div>}
                    </div>

                    {/* Name Selection */}
                    <div>
                        <label className="mb-1 block font-medium">Nama Pegawai</label>
                        <select
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={!data.unit_id || loadingPegawai}
                        >
                            <option value="">
                                {!data.unit_id
                                    ? 'Pilih unit terlebih dahulu'
                                    : loadingPegawai
                                    ? 'Memuat pegawai...'
                                    : availableNames.length === 0
                                    ? 'Tidak ada pegawai tersedia'
                                    : 'Pilih Nama Pegawai'
                                }
                            </option>
                            {availableNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        {errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-1 block font-medium">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Masukkan email pegawai"
                        />
                        {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block font-medium">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Masukkan password"
                        />
                        <small className="text-gray-500">
                            {user ? 'Kosongkan jika tidak ingin mengubah password.' : 'Minimal 8 karakter.'}
                        </small>
                        {errors.password && <div className="mt-1 text-sm text-red-500">{errors.password}</div>}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-1 block font-medium">Role</label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Pilih Role</option>
                            {allRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {errors.role && <div className="mt-1 text-sm text-red-500">{errors.role}</div>}
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 flex justify-between">
                        <button
                            type="submit"
                            disabled={processing || loadingUnits || loadingPegawai}
                            className="rounded-md border border-green-600 px-6 py-2 text-green-600 transition hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
