import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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

export default function Dashboard({ riskMatrixData, filterOptions, filters }: Props) {
    const [unit, setUnit] = useState(filters?.unit || '');
    const [kategori, setKategori] = useState(filters?.kategori || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [popupData, setPopupData] = useState<{ x: number; y: number; value: number; label: string; detail?: RiskDetail } | null>(null);

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

    const { auth } = usePage().props as any;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');

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

    const handleCellClick = async (x: number, y: number, value: number, label: string) => {
        try {
            const response = await fetch(`/dashboard/risk-detail/${label}`);
            const data = await response.json();
            setPopupData({ x, y, value, label, detail: data });
        } catch (error) {
            setPopupData({ x, y, value, label, detail: undefined });
        }
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

                    <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sebelum)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSebelum} onCellClick={handleCellClick} />
                        </div>
                        <div className="flex-1 rounded-xl border bg-white p-4">
                            <h3 className="mb-2 text-center text-lg font-semibold">
                                Peta Risiko <span className="font-normal">(Sesudah)</span>
                            </h3>
                            <RiskMatrixTable riskPoints={riskPointsSesudah} onCellClick={handleCellClick} />
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

                    {popupData && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-3/4 rounded-lg bg-white p-6 shadow-lg">
                                <h4 className="mb-4 text-xl font-semibold">Detail Risiko</h4>
                                <table className="w-full border">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1">No</th>
                                            <th className="border px-2 py-1">Kode Risiko</th>
                                            <th className="border px-2 py-1">Unit Kerja</th>
                                            <th className="border px-2 py-1">Deskripsi</th>
                                            <th className="border px-2 py-1">Penyebab</th>
                                            <th className="border px-2 py-1">Probabilitas Inherent</th>
                                            <th className="border px-2 py-1">Impact Inherent</th>
                                            <th className="border px-2 py-1">Tingkat Risiko Inherent</th>
                                            <th className="border px-2 py-1">Status</th>
                                            <th className="border px-2 py-1">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {popupData.detail ? (
                                            <tr>
                                                <td className="border px-2 py-1">{popupData.label}</td>
                                                <td className="border px-2 py-1">{popupData.detail.id_identify}</td>
                                                <td className="border px-2 py-1">{popupData.detail.unit_kerja}</td>
                                                <td className="border px-2 py-1">{popupData.detail.description}</td>
                                                <td className="border px-2 py-1">Penyebab {popupData.label}</td>
                                                <td className="border px-2 py-1">{probabilityLabels[popupData.detail.inherent.probability - 1]}</td>
                                                <td className="border px-2 py-1">{impactLabels[popupData.detail.inherent.impact - 1]}</td>
                                                <td className="border px-2 py-1">{popupData.detail.inherent.level}</td>
                                                <td className="border px-2 py-1">{popupData.detail.mitigation.status || 'aktif'}</td>
                                                <td className="border px-2 py-1">
                                                    <button className="rounded bg-blue-500 px-2 py-1 text-white">Evaluasi</button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="border px-2 py-1 text-center">Tidak ada data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <button
                                    className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
                                    onClick={closePopup}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function RiskMatrixTable({ riskPoints, onCellClick }: { riskPoints: { x: number; y: number; label: string }[]; onCellClick: (x: number, y: number, value: number, label: string) => void }) {
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
                                        onClick={() => onCellClick(x, y, cell, label)}
                                    >
                                        <span
                                            className={`font-bold ${text} mx-auto my-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-base shadow md:h-16 md:w-16 md:text-xl cursor-pointer`}
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
