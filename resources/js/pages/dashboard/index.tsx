import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

// Data matriks dan label (tetap sama)
const riskMatrix = [
    [5, 10, 15, 20, 25],
    [4, 8, 12, 16, 20],
    [3, 6, 9, 12, 15],
    [2, 4, 6, 8, 10],
    [1, 2, 3, 4, 5],
];

const impactLabels = ['Sangat Berpengaruh', 'Berpengaruh', 'Cukup Berpengaruh', 'Kurang Berpengaruh', 'Tidak Berpengaruh'];
const probabilityLabels = ['Sangat Jarang Terjadi', 'Jarang Terjadi', 'Kadang Terjadi', 'Sering Terjadi', 'Pasti Terjadi'];

// 🔥 Interface untuk data dari backend
interface Props {
    riskMatrixData?: {
        riskPointsSebelum: Array<{ x: number; y: number; label: string }>;
        riskPointsSesudah: Array<{ x: number; y: number; label: string }>;
        tingkatRisiko: Array<{ tingkat: string; inheren: number; residual: number; color: string }>;
    };
    filterOptions?: {
        units: string[];
        kategoris: string[];
        tahuns: string[];
    };
    filters?: {
        unit?: string;
        kategori?: string;
        tahun?: string;
    };
}

export default function Dashboard({ riskMatrixData, filterOptions, filters }: Props) {
    const [unit, setUnit] = useState(filters?.unit || '');
    const [kategori, setKategori] = useState(filters?.kategori || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');

    const riskPointsSebelum = riskMatrixData?.riskPointsSebelum || [
        { x: 1, y: 3, label: '1' },
        { x: 1, y: 4, label: '2' },
        { x: 2, y: 4, label: '5' },
        { x: 2, y: 1, label: '4' },
        { x: 2, y: 2, label: '3' },
    ];

    const riskPointsSesudah = riskMatrixData?.riskPointsSesudah || [
        { x: 1, y: 2, label: '1' },
        { x: 1, y: 3, label: '2' },
        { x: 2, y: 2, label: '5' },
        { x: 2, y: 1, label: '4' },
        { x: 2, y: 2, label: '3' },
    ];

    const tingkatRisiko = riskMatrixData?.tingkatRisiko || [
        { tingkat: 'Sangat Rendah', inheren: 0, residual: 2, color: 'bg-green-500' },
        { tingkat: 'Rendah', inheren: 0, residual: 3, color: 'bg-yellow-300' },
        { tingkat: 'Sedang', inheren: 3, residual: 0, color: 'bg-yellow-500' },
        { tingkat: 'Tinggi', inheren: 2, residual: 0, color: 'bg-red-500' },
    ];

    // Ambil role dari props
    const { auth } = usePage().props as any;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');

    // 🔥 Filter functionality - kirim ke backend
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

    // 🔥 Auto-apply filter dengan debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (unit !== filters?.unit || kategori !== filters?.kategori || tahun !== filters?.tahun) {
                handleFilterChange();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [unit, kategori, tahun]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="jus flex min-h-screen flex-col">
                <div className="flex flex-1 flex-col gap-4 overflow-auto rounded-xl p-4">
                    <h2 className="mb-2 text-xl font-semibold">Matriks Risiko</h2>

                    {/* Filter hanya untuk super-admin */}
                    {isSuperAdmin && (
                        <div className="mb-2 flex flex-col justify-end gap-4 md:flex-row">
                            {/* Unit Select */}
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger className="rounded border px-3 py-2">
                                    <SelectValue placeholder="Pilih Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(filterOptions?.units?.length ? filterOptions.units : ['unit1', 'unit2']).map((unitOption) => (
                                        <SelectItem key={unitOption} value={unitOption}>
                                            {unitOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Kategori Select */}
                            <Select value={kategori} onValueChange={setKategori}>
                                <SelectTrigger className="rounded border px-3 py-2">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(filterOptions?.kategoris?.length ? filterOptions.kategoris : ['kategori1', 'kategori2']).map(
                                        (kategoriOption) => (
                                            <SelectItem key={kategoriOption} value={kategoriOption}>
                                                {kategoriOption}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            {/* Tahun Select */}
                            <Select value={tahun} onValueChange={setTahun}>
                                <SelectTrigger className="rounded border px-3 py-2">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(filterOptions?.tahuns?.length ? filterOptions.tahuns : ['2024', '2025']).map((tahunOption) => (
                                        <SelectItem key={tahunOption} value={tahunOption}>
                                            {tahunOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Matriks Risiko Sebelum & Sesudah - format tetap sama */}
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sebelum)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSebelum} />
                        </div>
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sesudah)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSesudah} />
                        </div>
                    </div>

                    {/* Tabel Tingkatan Risiko - format tetap sama */}
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
                </div>
            </div>
        </AppLayout>
    );
}

// 🔥 Komponen RiskMatrixTable - TIDAK DIUBAH, tetap sama persis
function RiskMatrixTable({ riskPoints }: { riskPoints: { x: number; y: number; label: string }[] }) {
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
                                // Hitung total risiko di cell ini
                                const totalRisiko = points.length;
                                return (
                                    <td key={colIdx} className={`relative h-10 w-1/5 border border-black p-0 text-center md:h-20 ${bg}`}>
                                        <span
                                            className={`font-bold ${text} mx-auto my-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-base shadow md:h-16 md:w-16 md:text-xl`}
                                            style={{ background: 'rgba(255,255,255,0.18)' }}
                                        >
                                            {cell}
                                        </span>
                                        {/* Total risiko di bawah lingkaran */}
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
