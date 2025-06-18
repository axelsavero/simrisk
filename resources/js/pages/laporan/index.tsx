import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

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
        rekomendasi: 'Peningkatan infrastruktur jaringan internet server, router, dan penambahan switch, access point, dan mengoptimalkan pengelolaan bandwidth untuk memastikan distribusi bandwidth yang optimal.',
    },
    {
        no: 3,
        kode: '003_TIK_UNJ_XL_2024',
        deskripsi: 'Pengelolaan kerja di dunia admin dan dunia kerja melibatkan data/arsip aset digital.',
        penanganan: [
            '1) Pembuatan peraturan minimal pengelolaan kerja',
            '2) Melakukan interview mendalam terkait pengalaman kerja',
        ].join('\n'),
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
        penanganan: [
            'Pengembangan sistem informasi aset yang handal',
        ].join('\n'),
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
        rekomendasi: 'Subbagian Inventarisasi dan Pengelolaan Aset Bagian Aset melakukan pendataan dan pengelolaan aset secara periodik terhadap pemanfaatan aset.',
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
        <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/laporan' }]}>
            <Head title="Laporan" />
            <div className="min-h-screen bg-gray-100 p-4">
                {/* Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
                    <select className="w-64 rounded border px-4 py-3 text-lg" value={unit} onChange={e => setUnit(e.target.value)}>
                        <option value="">Pilih Unit</option>
                        <option value="UPT TIK">UPT TIK</option>
                        <option value="Bagian Aset">Bagian Aset</option>
                    </select>
                    <select className="w-64 rounded border px-4 py-3 text-lg" value={kategori} onChange={e => setKategori(e.target.value)}>
                        <option value="">Kategori</option>
                        <option value="TI">TI</option>
                        <option value="Aset">Aset</option>
                    </select>
                    <select className="w-64 rounded border px-4 py-3 text-lg" value={tahun} onChange={e => setTahun(e.target.value)}>
                        <option value="">Tahun</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
                {/* Table */}
                <div className="overflow-x-auto rounded bg-white p-4">
                    <table className="min-w-[1200px] w-full border border-black text-xs">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">NO.</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">KODE RISIKO</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">DESKRIPSI ATAU KEJADIAN RISIKO</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">PENANGANAN RISIKO</th>
                                <th colSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">JADWAL DAN PELAKSANAAN</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">KET</th>
                                <th colSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">BIAYA PENANGANAN RISIKO (RP)</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">VARIANS BIAYA</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">STATUS PENGENDALIAN</th>
                                <th colSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">DIPERIKSA OLEH</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">PEMILIK RISIKO</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">PELAKSANA PENANGANAN RISIKO</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">PENANGGUNG JAWAB PENANGANAN RISIKO</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 bg-gray-100 font-bold">REKOMENDASI / TINDAKAN LEBIH LANJUT</th>
                            </tr>
                            <tr>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">SESUAI / TIDAK SESUAI</th>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">KET</th>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">RENCANA</th>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">REALISASI</th>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">SPI</th>
                                <th className="border border-black px-2 py-1 bg-gray-100 font-bold">URM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporanData.map((row) => (
                                <tr key={row.no}>
                                    <td className="border border-black px-2 py-1 align-top">{row.no}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.kode}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.deskripsi}</td>
                                    <td className="border border-black px-2 py-1 align-top whitespace-pre-line">{row.penanganan}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.jadwal}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.ket}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.ket}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.rencana}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.realisasi}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.varian}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.status}</td>
                                    <td className="border border-black px-2 py-1 align-top text-center">{row.diperiksa_spi ? '✓' : ''}</td>
                                    <td className="border border-black px-2 py-1 align-top text-center">{row.diperiksa_urm ? '✓' : ''}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.pemilik}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.pelaksana}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.penanggung}</td>
                                    <td className="border border-black px-2 py-1 align-top">{row.rekomendasi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Tombol Cetak */}
                <div className="flex justify-center mt-8">
                    <button
                        className="rounded border bg-white px-12 py-4 text-lg shadow hover:bg-gray-200 transition"
                        onClick={() => window.print()}
                    >
                        Cetak
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}