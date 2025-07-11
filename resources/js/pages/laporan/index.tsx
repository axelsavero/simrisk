import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/laporan' },
];

const laporanData = [
    {
        no: 1,
        kode: '001_TIK_UNJ_XL_2024',
        deskripsi: 'Ancaman peretasan data server',
        penanganan: [
            '1) Membersihkan situs-situs UNJ dari segala plugin yang tidak berlisensi',
            '2) Sosialisasi ke user tentang pentingnya kesadaran akan ancaman digital agar lebih waspada/melaporkan phishing/kejanggalan',
            '3) Analisis kebutuhan bandwidth',
            '4) Penambahan titik akses perpot pada lokasi yang belum / minim coverage',
            '5) Pembersihan trafik/malware, trafik untuk penelitian dan pendidikan tidak diarahkan keluar UNJ, memantau trafik abnormal pada backbone dan cloud',
        ].join('\n'),
        jadwal: 'SESUAI',
        ket: 'BAK',
        rencana: '1.000.000.000',
        realisasi: '1.000.000.000',
        varian: '0',
        status: 'BAK',
        diperiksa_spi: true,
        diperiksa_urm: true,
        pemilik: 'Rafuddin Syam',
        pelaksana: 'UPT TIK',
        penanggung: 'UPT TIK',
        rekomendasi: 'Divisi Jaringan dan Infrastruktur UPT TIK melakukan monitoring terhadap threat jaringan dan situs web dan aplikasi universitas',
    },
    {
        no: 2,
        kode: '002_TIK_UNJ_XL_2024',
        deskripsi: 'Topologi jaringan internet dan intranet yang kurang sesuai dengan kebutuhan.',
        penanganan: [
            '1) Peningkatan infrastruktur jaringan internet server, router, dan penambahan switch, access point, dan mengoptimalkan pengelolaan bandwidth untuk memastikan distribusi bandwidth yang optimal.',
        ].join('\n'),
        jadwal: 'SESUAI',
        ket: 'BAK',
        rencana: '250.000.000',
        realisasi: '250.000.000',
        varian: '0',
        status: 'BAK',
        diperiksa_spi: true,
        diperiksa_urm: true,
        pemilik: 'Rafuddin Syam',
        pelaksana: 'UPT TIK',
        penanggung: 'UPT TIK',
        rekomendasi:
            'Peningkatan infrastruktur jaringan internet server, router, dan penambahan switch, access point, dan mengoptimalkan pengelolaan bandwidth untuk memastikan distribusi bandwidth yang optimal.',
    },
    {
        no: 3,
        kode: '003_TIK_UNJ_XL_2024',
        deskripsi: 'Pengelolaan kerja di dunia admin dan dunia kerja melibatkan data/arsip aset digital.',
        penanganan: ['1) Pembuatan peraturan minimal pengelolaan kerja', '2) Melakukan interview mendalam terkait pengalaman kerja'].join('\n'),
        jadwal: 'SESUAI',
        ket: 'BAK',
        rencana: '100.000.000',
        realisasi: '100.000.000',
        varian: '0',
        status: 'BAK',
        diperiksa_spi: true,
        diperiksa_urm: true,
        pemilik: 'Rafuddin Syam',
        pelaksana: 'UPT TIK',
        penanggung: 'UPT TIK',
        rekomendasi: 'Bagian Umum dan Kepegawaian membantu dalam kegiatan administrasi dan pengelolaan arsip aset digital.',
    },
    {
        no: 4,
        kode: '004_TIK_UNJ_XL_2024',
        deskripsi: 'Belum terkelolanya pengadaan dan inventarisasi aset dengan baik',
        penanganan: ['Pengembangan sistem informasi aset yang handal'].join('\n'),
        jadwal: 'SESUAI',
        ket: 'BAK',
        rencana: '80.000.000',
        realisasi: '80.000.000',
        varian: '0',
        status: 'BAK',
        diperiksa_spi: true,
        diperiksa_urm: true,
        pemilik: 'Rafuddin Syam',
        pelaksana: 'UPT TIK',
        penanggung: 'UPT TIK',
        rekomendasi:
            'Subbagian Inventarisasi dan Pengelolaan Aset Bagian Aset melakukan pendataan dan pengelolaan aset secara periodik terhadap pemanfaatan aset.',
    },
    {
        no: 5,
        kode: '005_TIK_UNJ_XL_2024',
        deskripsi: 'Belum tercapainya perencanaan pengadaan yang valid dan akurat',
        penanganan: [
            '1) Membuat Petunjuk pengadaan barang/jasa yang mengatur tentang perencanaan pengadaan barang/jasa',
            '2) Mengadakan penguatan sistem informasi yang ada di UNJ',
        ].join('\n'),
        jadwal: 'SESUAI',
        ket: 'BAK',
        rencana: '50.000.000',
        realisasi: '50.000.000',
        varian: '0',
        status: 'BAK',
        diperiksa_spi: true,
        diperiksa_urm: true,
        pemilik: 'Rafuddin Syam',
        pelaksana: 'UPT TIK',
        penanggung: 'UPT TIK',
        rekomendasi: 'Subbagian Inventarisasi dan Pengelolaan Aset melakukan perencanaan pengadaan dilakukan menggunakan sistem yang terintegrasi.',
    },
];

export default function LaporanIndex() {
    const [unit, setUnit] = useState('');
    const [kategori, setKategori] = useState('');
    const [tahun, setTahun] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
                {/* Filter Section - Responsive */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <select
                        className="w-full rounded border px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64 sm:text-lg"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    >
                        <option value="">Pilih Unit</option>
                        <option value="UPT TIK">UPT TIK</option>
                        <option value="Bagian Aset">Bagian Aset</option>
                    </select>
                    <select
                        className="w-full rounded border px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64 sm:text-lg"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                    >
                        <option value="">Kategori</option>
                        <option value="TI">TI</option>
                        <option value="Aset">Aset</option>
                    </select>
                    <select
                        className="w-full rounded border px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64 sm:text-lg"
                        value={tahun}
                        onChange={(e) => setTahun(e.target.value)}
                    >
                        <option value="">Tahun</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>

                {/* Table Container - Responsive with Horizontal Scroll */}
                <div className="w-full overflow-x-auto rounded bg-white p-2 shadow-lg sm:p-4">
                    <table className="w-full min-w-[1200px] table-auto border-collapse border border-black text-[10px] sm:text-xs">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    NO.
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    KODE RISIKO
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    DESKRIPSI ATAU KEJADIAN RISIKO
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    PENANGANAN RISIKO
                                </th>
                                <th colSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    JADWAL DAN PELAKSANAAN
                                </th>
                                <th colSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    BIAYA PENANGANAN RISIKO (RP)
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    VARIANS BIAYA
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    STATUS PENGENDALIAN
                                </th>
                                <th colSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    DIPERIKSA OLEH
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    PEMILIK RISIKO
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    PELAKSANA PENANGANAN RISIKO
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    PENANGGUNG JAWAB PENANGANAN RISIKO
                                </th>
                                <th rowSpan={2} className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    REKOMENDASI / TINDAKAN LEBIH LANJUT
                                </th>
                            </tr>
                            <tr>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">
                                    SESUAI / TIDAK SESUAI
                                </th>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">KET</th>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">RENCANA</th>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">REALISASI</th>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">SPI</th>
                                <th className="border border-black bg-gray-100 px-2 py-1 text-center align-middle font-bold">URM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporanData.map((row) => (
                                <tr key={row.no} className="hover:bg-gray-50">
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.no}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.kode}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.deskripsi}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words whitespace-pre-line">{row.penanganan}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.jadwal}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.ket}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.ket}</td>
                                    <td className="border border-black px-2 py-1 text-right align-middle">{row.rencana}</td>
                                    <td className="border border-black px-2 py-1 text-right align-middle">{row.realisasi}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.varian}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.status}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.diperiksa_spi ? '✓' : ''}</td>
                                    <td className="border border-black px-2 py-1 text-center align-middle">{row.diperiksa_urm ? '✓' : ''}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.pemilik}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.pelaksana}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.penanggung}</td>
                                    <td className="border border-black px-2 py-1 align-middle break-words">{row.rekomendasi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Print Button - Responsive */}
                <div className="mt-4 flex justify-center sm:mt-8">
                    <button
                        className="rounded border bg-white px-6 py-2 text-base shadow transition hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-12 sm:py-4 sm:text-lg"
                        onClick={() => window.print()}
                    >
                        Cetak
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }

                    table {
                        font-size: 8px !important;
                        width: 100% !important;
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    .overflow-x-auto {
                        overflow: visible !important;
                    }

                    .min-w-\\[1400px\\],
                    .min-w-\\[1600px\\],
                    .min-w-\\[1800px\\] {
                        min-width: 100% !important;
                    }

                    .shadow-lg {
                        box-shadow: none !important;
                    }

                    .bg-gray-100 {
                        background-color: #f5f5f5 !important;
                    }

                    .hover\\:bg-gray-50:hover {
                        background-color: transparent !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
