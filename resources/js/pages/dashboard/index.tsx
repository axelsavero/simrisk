import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ReactSelect from 'react-select';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const riskMatrix = [
    [5, 10, 15, 20, 25],
    [4, 8, 12, 16, 20],
    [3, 6, 9, 12, 15],
    [2, 4, 6, 8, 10],
    [1, 2, 3, 4, 5],
];

const impactLabels = ['Sangat Berpengaruh', 'Berpengaruh', 'Cukup Berpengaruh', 'Kurang Berpengaruh', 'Tidak Berpengaruh'];
const probabilityLabels = ['Sangat Jarang Terjadi', 'Jarang Terjadi', 'Kadang Terjadi', 'Sering Terjadi', 'Pasti Terjadi'];

interface Props {
    riskMatrixData?: {
        riskPointsSebelum: Array<{ x: number; y: number; label: string; validation_status?: string }>;
        riskPointsSesudah: Array<{ x: number; y: number; label: string; validation_status?: string }>;
        tingkatRisiko: Array<{ tingkat: string; inheren: number; residual: number; color: string }>;
    };
    mitigasiMatrixData?: {
        mitigasiPoints: Array<{
            id: number;
            x: number;
            y: number;
            label: string;
            judul_mitigasi: string;
            kode_risiko: string;
            nama_risiko: string;
            strategi_mitigasi: string;
            status_mitigasi: string;
            progress_percentage: number;
            pic_mitigasi: string;
            target_selesai?: string | null;
            unit_kerja: string;
            level: number;
            level_text: string;
        }>;
        totalMitigasi: number;
        statusStats: Record<string, number>;
        strategiStats: Record<string, number>;
        completionRate: number;
        averageProgress: number;
    };
    filterOptions?: {
        // units: string[]; // This will now be fetched via API
        kategoris: string[];
        tahuns: string[];
    };
    filters?: {
        unit?: string;
        kategori?: string;
        tahun?: string;
    };
}

interface RiskDetail {
    id: number;
    id_identify: string;
    description: string;
    unit_kerja: string;
    inherent: {
        probability: number;
        impact: number;
        level: number;
        level_text: string;
    };
    residual: {
        probability: number;
        impact: number;
        level: number;
        level_text: string;
    };
    mitigation: {
        rencana: string;
        target: string;
        status: string;
        reduction: number;
    };
}

// Interface for the unit data fetched from the API
interface Unit {
    id: number | string;
    name: string;
}

export default function Dashboard({ riskMatrixData, mitigasiMatrixData, filterOptions, filters }: Props) {
    const [unit, setUnit] = useState(filters?.unit || '');
    const [kategori, setKategori] = useState(filters?.kategori || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [popupData, setPopupData] = useState<{
        x: number;
        y: number;
        value: number;
        type: 'sebelum' | 'sesudah';
        items: Array<
            RiskPoint & {
                kode_risiko?: string;
                nama_risiko?: string;
                unit_kerja?: string;
            }
        >;
    } | null>(null);

    // State for managing units fetched from API
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');

    // Only show validated risks (exclude pending/submitted)
    const riskPointsSebelum = (riskMatrixData?.riskPointsSebelum || []).filter((p) => p.validation_status === 'approved');

    const riskPointsSesudah = (riskMatrixData?.riskPointsSesudah || []).filter((p) => p.validation_status === 'approved');

    const tingkatRisiko = riskMatrixData?.tingkatRisiko || [
        { tingkat: 'Sangat Rendah', inheren: 0, residual: 2, color: 'bg-green-500' },
        { tingkat: 'Rendah', inheren: 0, residual: 3, color: 'bg-yellow-300' },
        { tingkat: 'Sedang', inheren: 3, residual: 0, color: 'bg-yellow-500' },
        { tingkat: 'Tinggi', inheren: 2, residual: 0, color: 'bg-red-500' },
    ];

    const { auth } = usePage().props as any;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');

    // Utility function to process API data, adapted from form.tsx
    // We no longer need processApiData since we're using a simpler API response structure

    // Function to fetch units from local database
    const fetchUnits = async () => {
        setLoadingUnits(true);
        setApiError('');
        try {
            const response = await fetch(`/api/units`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Gagal mengambil data unit.`);
            }
            const data = await response.json();
            
            if (!data.success || !data.units || !data.units.length) {
                throw new Error('Tidak ada data unit yang ditemukan.');
            }

            const transformedUnits = data.units.map((unit: { id: number; nama_unit: string }) => ({
                id: unit.id,
                name: unit.nama_unit,
            }));
            
            setUnits(transformedUnits);
        } catch (error) {
            setApiError(`❌ Gagal memuat unit: ${error.message}`);
            // Fallback to dummy data in development for UI testing
            if (process.env.NODE_ENV === 'development') {
                setUnits([
                    { id: 1, name: 'Unit HRD (Dummy)' },
                    { id: 2, name: 'Unit IT (Dummy)' },
                ]);
            } else {
                setUnits([]);
            }
        } finally {
            setLoadingUnits(false);
        }
    };

    // Fetch units when the component mounts
    useEffect(() => {
        if (isSuperAdmin) {
            fetchUnits();
        }
    }, [isSuperAdmin]);

    const handleFilterChange = () => {
        router.get(
            '/dashboard',
            {
                unit: unit || undefined,
                kategori: kategori || undefined,
                tahun: tahun || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (unit !== filters?.unit || kategori !== filters?.kategori || tahun !== filters?.tahun) {
                handleFilterChange();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [unit, kategori, tahun]);

    const openPopupForCell = (type: 'sebelum' | 'sesudah', x: number, y: number, value: number) => {
        if (type === 'sesudah' && mitigasiMatrixData?.mitigasiPoints) {
            let items = mitigasiMatrixData.mitigasiPoints.filter((p) => p.x === x && p.y === y) as any[];
            // Fallback: if unit_kerja missing on mitigasi points, enrich from residual risk points of the same cell
            const residualCellRisks = riskPointsSesudah.filter((p) => p.x === x && p.y === y);
            const fallbackUnit = residualCellRisks.length > 0 ? (residualCellRisks[0] as any).unit_kerja : undefined;
            if (fallbackUnit) {
                items = items.map((it) => ({ ...it, unit_kerja: it.unit_kerja || fallbackUnit }));
            }
            setPopupData({ x, y, value, type, items });
            return;
        }
        const source = type === 'sebelum' ? riskPointsSebelum : riskPointsSesudah;
        const items = source.filter((p) => p.x === x && p.y === y);
        setPopupData({ x, y, value, type, items });
    };

    const closePopup = () => {
        setPopupData(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="jus flex min-h-screen flex-col">
                <div className="flex flex-1 flex-col gap-4 overflow-auto rounded-xl p-4">
                    <h2 className="mb-2 text-xl font-semibold">Matriks Risiko</h2>

                    {isSuperAdmin && (
                        <div className="mb-2 flex flex-col justify-end gap-4 md:flex-row">
                            {/* Tombol Sinkron Data Unit */}
                            <button
                                className="rounded bg-green-700 px-4 py-2 text-white font-semibold hover:bg-green-800 transition"
                                onClick={async () => {
                                    if (confirm('Sinkronisasi data unit dari SIPEG?')) {
                                        try {
                                            const res = await fetch('/api/sinkron-unit', { method: 'POST', credentials: 'include' });
                                            const data = await res.json();
                                            alert(data.message || 'Sinkronisasi selesai');
                                        } catch (err) {
                                            alert('Gagal sinkronisasi unit!');
                                        }
                                    }
                                }}
                            >
                                Sync
                            </button>
                            {apiError && <p className="self-center text-sm text-red-500">{apiError}</p>}
                            <ReactSelect
                                className="w-full"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#d1d5db',
                                        boxShadow: 'none',
                                        ':hover': { borderColor: '#9ca3af' },
                                    }),
                                }}
                                options={units.map((unitOption) => ({
                                    value: unitOption.name,
                                    label: unitOption.name,
                                }))}
                                value={unit ? { value: unit, label: unit } : null}
                                onChange={(selected) => setUnit(selected ? selected.value : '')}
                                isLoading={loadingUnits}
                                placeholder={loadingUnits ? 'Memuat unit...' : 'Pilih Unit'}
                                isClearable
                            />
                            <ReactSelect
                                className="w-full"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#d1d5db',
                                        boxShadow: 'none',
                                        ':hover': { borderColor: '#9ca3af' },
                                    }),
                                }}
                                options={(filterOptions?.kategoris?.length
                                    ? filterOptions.kategoris
                                    : ['Strategis', 'Operasional', 'Keuangan', 'Kepatuhan', 'Kecurangan']
                                ).map((k) => ({
                                    value: k,
                                    label: k,
                                }))}
                                value={kategori ? { value: kategori, label: kategori } : null}
                                onChange={(selected) => setKategori(selected ? selected.value : '')}
                                placeholder="Kategori"
                                isClearable
                            />
                            <ReactSelect
                                className="w-full"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#d1d5db',
                                        boxShadow: 'none',
                                        ':hover': { borderColor: '#9ca3af' },
                                    }),
                                }}
                                options={(filterOptions?.tahuns?.length ? filterOptions.tahuns : ['2024', '2025']).map((t) => ({
                                    value: t,
                                    label: t,
                                }))}
                                value={tahun ? { value: tahun, label: tahun } : null}
                                onChange={(selected) => setTahun(selected ? selected.value : '')}
                                placeholder="Tahun"
                                isClearable
                            />
                        </div>
                    )}

                    {/* ... (rest of the component remains the same) ... */}
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sebelum)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSebelum} onCellClick={(x, y, value) => openPopupForCell('sebelum', x, y, value)} />
                        </div>
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sesudah)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSesudah} onCellClick={(x, y, value) => openPopupForCell('sesudah', x, y, value)} />
                        </div>
                    </div>

                    <div className="mt-6 w-full rounded-xl border bg-white p-4">
                        <h3 className="mb-2 text-center font-semibold">Tingkatan Risiko</h3>
                        <table className="w-full border text-center">
                            <thead>
                                <tr>
                                    <th className="border bg-gray-200 px-2 py-1">Tingkatan</th>
                                    <th className="border bg-gray-200 px-2 py-1">Jumlah Risiko Inheren</th>
                                    <th className="border bg-blue-400 px-2 py-1 text-white">Jumlah Risiko Residual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tingkatRisiko.map((row) => (
                                    <tr key={row.tingkat}>
                                        <td className="border px-2 py-1">{row.tingkat}</td>
                                        <td className={`border px-2 py-1 ${row.color}`}>{row.inheren}</td>
                                        <td className={`border px-2 py-1 ${row.color}`}>{row.residual}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="border bg-gray-200 px-2 py-1 font-semibold">Jumlah</td>
                                    <td className="border bg-gray-200 px-2 py-1 font-semibold">{tingkatRisiko.reduce((a, b) => a + b.inheren, 0)}</td>
                                    <td className="border bg-gray-200 px-2 py-1 font-semibold">
                                        {tingkatRisiko.reduce((a, b) => a + b.residual, 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {mitigasiMatrixData && <></>}

                    {popupData && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
                                <h4 className="mb-4 text-xl font-semibold">
                                    {popupData.type === 'sebelum' ? 'Detail Risiko (Inheren)' : 'Detail Mitigasi (Residual)'} • Bobot{' '}
                                    {popupData.value}
                                </h4>
                                <table className="w-full border">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1">No</th>
                                            <th className="border px-2 py-1">Kode Risiko</th>
                                            <th className="border px-2 py-1">Unit Kerja</th>
                                            <th className="border px-2 py-1">
                                                {popupData.type === 'sebelum' ? 'Deskripsi Risiko' : 'Judul Mitigasi'}
                                            </th>
                                            {popupData.type === 'sesudah' && <th className="border px-2 py-1">Strategi</th>}
                                            {popupData.type === 'sesudah' && <th className="border px-2 py-1">Status</th>}
                                            {popupData.type === 'sesudah' && <th className="border px-2 py-1">Progress</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {popupData.items.length > 0 ? (
                                            popupData.items.map((item: any, idx: number) => (
                                                <tr key={`${item.label || item.id}-${idx}`}>
                                                    <td className="border px-2 py-1">{idx + 1}</td>
                                                    <td className="border px-2 py-1">{item.kode_risiko || item.label}</td>
                                                    <td className="border px-2 py-1">{item.unit_kerja || '-'}</td>
                                                    <td className="border px-2 py-1">
                                                        {popupData.type === 'sebelum' ? item.nama_risiko || '-' : item.judul_mitigasi || '-'}
                                                    </td>
                                                    {popupData.type === 'sesudah' && (
                                                        <td className="border px-2 py-1 capitalize">{item.strategi_mitigasi}</td>
                                                    )}
                                                    {popupData.type === 'sesudah' && (
                                                        <td className="border px-2 py-1 capitalize">{item.status_mitigasi}</td>
                                                    )}
                                                    {popupData.type === 'sesudah' && (
                                                        <td className="border px-2 py-1">
                                                            {typeof item.progress_percentage === 'number' ? `${item.progress_percentage}%` : '-'}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={popupData.type === 'sebelum' ? 4 : 7} className="border px-2 py-4 text-center">
                                                    Tidak ada data pada sel ini
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-4 flex justify-end">
                                    <button className="rounded bg-red-500 px-4 py-2 text-white" onClick={closePopup}>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// ... (RiskMatrixTable component remains exactly the same) ...

type RiskPoint = {
    x: number;
    y: number;
    label: string;
    validation_status?: string;
    // ...other possible fields
    unit_kerja?: string;
    kode_risiko?: string;
    nama_risiko?: string;
};

function RiskMatrixTable({ riskPoints, onCellClick }: { riskPoints: RiskPoint[]; onCellClick: (x: number, y: number, value: number) => void }) {
    return (
        <div className="w-full overflow-x-hidden">
            <table className="w-full border border-black">
                <thead>
                    <tr>
                        <th className="border border-black bg-white" rowSpan={2} colSpan={2}></th>
                        <th className="border border-black bg-white text-center" colSpan={5}>
                            Peta Risiko
                        </th>
                    </tr>
                    <tr>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <th key={i} className="h-10 w-1/5 border border-black bg-white text-center font-normal md:h-16">
                                {i + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {riskMatrix.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {rowIdx === 0 && (
                                <td
                                    className="w-6 border border-black bg-white text-center md:w-8"
                                    rowSpan={5}
                                    style={{
                                        writingMode: 'vertical-rl',
                                        textOrientation: 'mixed',
                                        fontSize: 20,
                                        minWidth: 20,
                                        padding: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            minHeight: '340px',
                                        }}
                                    >
                                        Impact / Dampak
                                    </div>
                                </td>
                            )}
                            <td className="w-20 border border-black bg-white p-1 text-center align-middle text-xs md:w-32">
                                <span className="block text-base whitespace-normal">{impactLabels[rowIdx]}</span>
                            </td>
                            {row.map((cell, colIdx) => {
                                const points = riskPoints.filter((p) => p.x === colIdx + 1 && p.y === 5 - rowIdx);
                                let bg = '';
                                let text = 'text-white';
                                if (cell === 20 || cell === 25) {
                                    bg = 'bg-red-500';
                                    text = 'text-black';
                                } else if (cell >= 9 && cell <= 16) {
                                    bg = 'bg-orange-400';
                                    text = 'text-black';
                                } else if (cell >= 3 && cell <= 8) {
                                    bg = 'bg-yellow-300';
                                    text = 'text-black';
                                } else if (cell === 1 || cell === 2) {
                                    bg = 'bg-green-500';
                                    text = 'text-black';
                                }
                                const totalRisiko = points.length;
                                const x = colIdx + 1;
                                const y = 5 - rowIdx;
                                const label = points.length > 0 ? points[0].label : '';

                                return (
                                    <td
                                        key={colIdx}
                                        className={`relative h-10 w-1/5 border border-black p-0 text-center ${bg}`}
                                        onClick={() => onCellClick(x, y, cell)}
                                    >
                                        <span
                                            className={`font-bold ${text} mx-auto my-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base shadow md:h-16 md:w-16 md:text-xl`}
                                            style={{ background: 'rgba(255,255,255,0.18)' }}
                                        >
                                            {cell}
                                        </span>
                                        <div className="mt-1 mb-1 w-full text-center text-xs font-semibold" style={{ minHeight: '1.2em' }}>
                                            {totalRisiko > 0 ? `${totalRisiko} Risiko` : ''}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    <tr>
                        <td className="border border-black bg-white text-center font-bold" colSpan={2}></td>
                        {probabilityLabels.map((label, i) => (
                            <td key={i} className="w-1/5 border border-black bg-white px-1 text-center align-top text-xs">
                                <span className="block text-base break-words whitespace-normal">{label}</span>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <div className="mt-1 text-center text-xs font-semibold">Kemungkinan / Probabilitas</div>
        </div>
    );
}
