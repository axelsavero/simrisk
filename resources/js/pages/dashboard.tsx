import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

// Data matriks dan label
const riskMatrix = [
    [5, 10, 15, 20, 25],
    [4, 8, 12, 16, 20],
    [3, 6, 9, 12, 15],
    [2, 4, 6, 8, 10],
    [1, 2, 3, 4, 5],
];

const impactLabels = ['Sangat Berpengaruh', 'Berpengaruh', 'Cukup Berpengaruh', 'Kurang Berpengaruh', 'Tidak Berpengaruh'];
const probabilityLabels = ['Sangat Jarang Terjadi', 'Jarang Terjadi', 'Kadang Terjadi', 'Sering Terjadi', 'Pasti Terjadi'];

// Contoh data titik risiko
const riskPointsSebelum = [
    { x: 1, y: 3, label: '1' },
    { x: 1, y: 4, label: '2' },
    { x: 2, y: 4, label: '5' },
    { x: 2, y: 1, label: '4' },
    { x: 2, y: 2, label: '3' },
];
const riskPointsSesudah = [
    { x: 1, y: 2, label: '1' },
    { x: 1, y: 3, label: '2' },
    { x: 2, y: 2, label: '5' },
    { x: 2, y: 1, label: '4' },
    { x: 2, y: 2, label: '3' },
];

// Data tabel tingkatan risiko
const tingkatRisiko = [
    { tingkat: 'Sangat Rendah', inheren: 0, residual: 2, color: 'bg-green-500' },
    { tingkat: 'Rendah', inheren: 0, residual: 3, color: 'bg-yellow-300' },
    { tingkat: 'Sedang', inheren: 3, residual: 0, color: 'bg-yellow-500' },
    { tingkat: 'Tinggi', inheren: 2, residual: 0, color: 'bg-red-500' },
];

export default function Dashboard() {
    const [unit, setUnit] = useState('');
    const [kategori, setKategori] = useState('');
    const [tahun, setTahun] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="jus flex min-h-screen flex-col">
                <div className="flex flex-1 flex-col gap-4 overflow-auto rounded-xl p-4">
                    <h2 className="mb-2 text-xl font-semibold">Matriks Risiko</h2>
                    {/* Filter */}
                    <div className="mb-2 flex flex-col justify-end gap-4 md:flex-row">
                        <select className="rounded border px-3 py-2" value={unit} onChange={(e) => setUnit(e.target.value)}>
                            <option value="">Pilih Unit</option>
                            <option value="unit1">Unit 1</option>
                            <option value="unit2">Unit 2</option>
                        </select>
                        <select className="rounded border px-3 py-2" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                            <option value="">Kategori</option>
                            <option value="kategori1">Kategori 1</option>
                            <option value="kategori2">Kategori 2</option>
                        </select>
                        <select className="rounded border px-3 py-2" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                            <option value="">Tahun</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    {/* Matriks Risiko Sebelum & Sesudah */}
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
                    {/* Tabel Tingkatan Risiko di bawah */}
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

// Komponen Matriks Risiko
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
                                if (cell >= 20) {
                                    bg = 'bg-red-500';
                                    text = 'text-white';
                                } else if (cell >= 15) {
                                    bg = 'bg-orange-400';
                                    text = 'text-white';
                                } else if (cell >= 8) {
                                    bg = 'bg-yellow-300';
                                    text = 'text-black';
                                } else {
                                    bg = 'bg-green-500';
                                    text = 'text-white';
                                }
                                return (
                                    <td key={colIdx} className={`relative h-10 w-1/5 border border-black p-0 text-center md:h-20 ${bg}`}>
                                        <span
                                            className={`font-bold ${text} mx-auto my-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-base shadow md:h-16 md:w-16 md:text-xl`}
                                            style={{ background: 'rgba(255,255,255,0.18)' }}
                                        >
                                            {cell}
                                        </span>
                                        {points.map((p, i) => (
                                            <span
                                                key={i}
                                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-blue-600 bg-blue-200 text-xs"
                                                style={{ zIndex: 2, fontSize: 11 }}
                                            >
                                                {p.label}
                                            </span>
                                        ))}
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
