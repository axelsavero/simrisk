import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FC, useEffect, useState } from 'react';
import ReactSelect from 'react-select';

interface Breadcrumb {
    title: string;
    href: string;
}

const breadcrumbs: Breadcrumb[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/laporan' },
];

interface Risk {
    id: number;
    no?: number;
    kode?: string;
    deskripsi?: string;
    penanganan?: string | string[];
    jadwal?: string;
    ket?: string;
    rencana?: string;
    realisasi?: string;
    varian?: string;
    status?: string;
    diperiksa_spi?: boolean;
    diperiksa_urm?: boolean;
    pemilik?: string;
    unit?: string; // Added unit property
    pelaksana?: string;
    penanggung?: string;
    rekomendasi?: string;
    id_identify?: string;
    nama_risiko?: string;
}

interface Filters {
    search?: string;
    unit?: string;
    kategori?: string;
    tahun?: string;
    validation_status?: string;
}

interface FilterOptions {
    units?: string[];
    kategoris?: string[];
    tahuns?: string[];
    validation_statuses?: Record<string, string>;
}

interface Risks {
    data?: Risk[];
    current_page?: number;
    per_page?: number;
    last_page?: number;
}

interface PageProps {
    risks?: Risks;
    filterOptions?: FilterOptions;
    filters?: Filters;
    metaData: {
        generated_at: string;
        generated_by: string;
    };
    statistik?: Record<string, any>;
}

const Index: FC = () => {
    const {
        risks = { data: [], current_page: 1, per_page: 50, last_page: 1 },
        filterOptions = { units: [], kategoris: [], tahuns: [] },
        filters = {},
        metaData,
    } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [unit, setUnit] = useState(filters.unit || '');
    const [kategori, setKategori] = useState(filters.kategori || '');
    const [tahun, setTahun] = useState(filters.tahun || '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);
    const {
        data: signatureData,
        setData: setSignatureData,
        post,
        processing,
    } = useForm({
        jabatan: '',
        nama: '',
        nip: '',
    });

    const { post: postForm } = useForm();

    // Apply filters when state changes
    useEffect(() => {
        const query = { search, unit, kategori, tahun };
        router.get('/laporan', query, {
            preserveState: true,
            replace: true,
        });
    }, [search, unit, kategori, tahun]);

    // Handle export PDF
    const exportPdf = () => {
        post(
            '/laporan/export-pdf',
            { search, unit, kategori, tahun },
            {
                onSuccess: () => alert('PDF export initiated'),
                onError: () => alert('Error exporting PDF'),
            },
        );
    };

    // Handle export Excel
    const exportExcel = () => {
        post(
            '/laporan/export-excel',
            { search, unit, kategori, tahun },
            {
                onSuccess: () => alert('Excel export initiated'),
                onError: () => alert('Error exporting Excel'),
            },
        );
    };

    const handleOpenModal = (type: 'pdf' | 'excel') => {
        setExportType(type);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const exportUrl = exportType === 'pdf' ? route('laporan.export-pdf') : route('laporan.export-excel');
        const allFilters = { search, unit, kategori, tahun };

        // Membuat form sementara untuk memicu unduhan browser
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = exportUrl;

        // Tambahkan CSRF token (sangat penting untuk Laravel)
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Gabungkan filter dan data tanda tangan
        const dataToSubmit = { ...allFilters, ...signatureData };

        // Tambahkan semua data sebagai input tersembunyi
        for (const key in dataToSubmit) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `data[${key}]`; // Kirim sebagai array 'data'
            input.value = (dataToSubmit as any)[key];
            form.appendChild(input);
        }

        // Tambahkan form ke body, kirim, lalu hapus
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Tutup modal dan reset form
        setIsModalOpen(false);
        reset();
    };

    // Debugging
    useEffect(() => {
        console.log('Risks data:', risks);
        console.log('Filter Options:', filterOptions);
        console.log('Filters:', filters);
    }, [risks, filterOptions, filters]);

    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#9ca3af',
            },
        }),
    };

    const unitOptions = filterOptions.units?.map((u) => ({ value: u, label: u })) || [];
    const kategoriOptions = filterOptions.kategoris?.map((k) => ({ value: k, label: k })) || [];
    const tahunOptions = filterOptions.tahuns?.map((t) => ({ value: String(t), label: String(t) })) || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="min-h-screen bg-gray-100 p-4">
                {/* Filter Section - Responsive and Centered */}
                <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <ReactSelect
                        className="w-full text-base sm:w-64"
                        styles={customSelectStyles}
                        options={unitOptions}
                        value={unit ? { value: unit, label: unit } : null}
                        onChange={(selected) => setUnit(selected ? selected.value : '')}
                        placeholder="Pilih Unit"
                        isClearable
                        isSearchable
                    />
                    <ReactSelect
                        className="w-full text-base sm:w-64"
                        styles={customSelectStyles}
                        options={kategoriOptions}
                        value={kategori ? { value: kategori, label: kategori } : null}
                        onChange={(selected) => setKategori(selected ? selected.value : '')}
                        placeholder="Kategori"
                        isClearable
                        isSearchable
                    />
                    <ReactSelect
                        className="w-full text-base sm:w-64"
                        styles={customSelectStyles}
                        options={tahunOptions}
                        value={tahun ? { value: tahun, label: tahun } : null}
                        onChange={(selected) => setTahun(selected ? selected.value : '')}
                        placeholder="Tahun"
                        isClearable
                        isSearchable
                    />
                </div>

                {/* Table Container - Responsive with Enhanced Styling */}
                <div className="w-full overflow-x-auto rounded-lg bg-white p-4 shadow-lg">
                    <table className="w-full min-w-[1200px] table-auto border-collapse border border-gray-800 text-xs sm:text-sm">
                        <thead>
                            <tr>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    NO.
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    KODE RISIKO
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    DESKRIPSI ATAU KEJADIAN RISIKO
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    PENANGANAN RISIKO
                                </th>
                                <th colSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    JADWAL DAN PELAKSANAAN
                                </th>
                                <th colSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    BIAYA PENANGANAN RISIKO (RP)
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    VARIANS BIAYA
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    STATUS PENGENDALIAN
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    PEMILIK RISIKO
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    UNIT
                                </th>
                                <th rowSpan={2} className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                                    REKOMENDASI / TINDAKAN LEBIH LANJUT
                                </th>
                            </tr>
                            <tr>
                                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">MULAI</th>
                                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">SELESAI</th>
                                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">RENCANA</th>
                                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">REALISASI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {risks.data?.map((row, index) => (
                                <tr key={row.id} className="transition-colors hover:bg-gray-100">
                                    <td className="border border-gray-800 px-2 py-1 text-center align-middle">
                                        {(risks.current_page - 1) * risks.per_page + index + 1}
                                    </td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words">{row.id_identify || row.kode}</td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words">{row.nama_risiko || row.deskripsi}</td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words whitespace-pre-line">
                                        {Array.isArray(row.penanganan) ? row.penanganan.join('\n') : row.penanganan || '-'}
                                    </td>
                                    <td className="border border-gray-800 px-2 py-1 text-center align-middle">{row.jadwal || 'SESUAI'}</td>
                                    <td className="border border-gray-800 px-2 py-1 text-center align-middle">{row.ket || 'BAK'}</td>
                                    <td className="border border-gray-800 px-2 py-1 text-right align-middle">{row.rencana || '0'}</td>
                                    <td className="border border-gray-800 px-2 py-1 text-right align-middle">{row.realisasi || '0'}</td>
                                    <td className="border border-gray-800 px-2 py-1 text-center align-middle">{row.varian || '0'}</td>
                                    <td className="border border-gray-800 px-2 py-1 text-center align-middle">{row.status || 'BAK'}</td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words">{row.pemilik || '-'}</td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words">{row.unit || '-'}</td>
                                    <td className="border border-gray-800 px-2 py-1 align-middle break-words">{row.rekomendasi || '-'}</td>
                                </tr>
                            )) || (
                                <tr>
                                    <td colSpan={16} className="border border-gray-800 px-2 py-1 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Export Buttons - Diubah untuk membuka modal */}
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => handleOpenModal('pdf')}
                    >
                        Export PDF
                    </button>
                    <button
                        className="rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={() => handleOpenModal('excel')}
                    >
                        Export Excel
                    </button>
                </div>


                {/* Pagination - Centered and Styled */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                        className="rounded-lg bg-gray-300 px-4 py-2 transition-colors hover:bg-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                        onClick={() => router.get('/laporan/risk-detail', { ...filters, page: risks.current_page - 1 }, { preserveState: true })}
                        disabled={risks.current_page === 1 || !risks.data?.length}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {risks.current_page || 1} of {risks.last_page || 1}
                    </span>
                    <button
                        className="rounded-lg bg-gray-300 px-4 py-2 transition-colors hover:bg-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                        onClick={() => router.get('/laporan/risk-detail', { ...filters, page: risks.current_page + 1 }, { preserveState: true })}
                        disabled={risks.current_page === risks.last_page || !risks.data?.length}
                    >
                        Next
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
          .min-w-[1200px] {
            min-width: 100% !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .bg-gray-100 {
            background-color: #f5f5f5 !important;
          }
          .hover:bg-gray-50:hover {
            background-color: transparent !important;
          }
        }
      `}</style>
      {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold">Detail Penanggung Jawab Laporan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    className="w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Jabatan</label>
                                <input
                                    type="text"
                                    value={signatureData.jabatan}
                                    onChange={(e) => setSignatureData('jabatan', e.target.value)}
                                    className="w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: Kepala Unit Riset"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    value={signatureData.nama}
                                    onChange={(e) => setSignatureData('nama', e.target.value)}
                                    className="w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">NIP</label>
                                <input
                                    type="text"
                                    value={signatureData.nip}
                                    onChange={(e) => setSignatureData('nip', e.target.value)}
                                    className="w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Masukkan NIP"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={processing}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Mencetak...' : 'Cetak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Index;
