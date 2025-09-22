import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { FC, useState, useEffect } from 'react';

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
  const { risks = { data: [], current_page: 1, per_page: 50, last_page: 1 }, filterOptions = { units: [], kategoris: [], tahuns: [] }, filters = {}, metaData } = usePage<PageProps>().props;
  const [search, setSearch] = useState(filters.search || '');
  const [unit, setUnit] = useState(filters.unit || '');
  const [kategori, setKategori] = useState(filters.kategori || '');
  const [tahun, setTahun] = useState(filters.tahun || '');

  const { post } = useForm();

  // Apply filters when state changes
  useEffect(() => {
    const query = { search, unit, kategori, tahun };
    router.get('/laporan/risk-detail', query, {
      preserveState: true,
      replace: true,
    });
  }, [search, unit, kategori, tahun]);

  // Handle export PDF
  const exportPdf = () => {
    post('/laporan/export-pdf', { search, unit, kategori, tahun }, {
      onSuccess: () => alert('PDF export initiated'),
      onError: () => alert('Error exporting PDF'),
    });
  };

  // Handle export Excel
  const exportExcel = () => {
    post('/laporan/export-excel', { search, unit, kategori, tahun }, {
      onSuccess: () => alert('Excel export initiated'),
      onError: () => alert('Error exporting Excel'),
    });
  };

  // Debugging
  useEffect(() => {
    console.log('Risks data:', risks);
    console.log('Filter Options:', filterOptions);
    console.log('Filters:', filters);
  }, [risks, filterOptions, filters]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Laporan" />
      <div className="min-h-screen bg-gray-100 p-4">
        {/* Filter Section - Responsive and Centered */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <input
            type="text"
            placeholder="Pusat ..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="">Pilih Unit</option>
            {filterOptions.units?.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            )) || []}
          </select>
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="">Kategori</option>
            {filterOptions.kategoris?.map((kategori) => (
              <option key={kategori} value={kategori}>{kategori}</option>
            )) || []}
          </select>
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
          >
            <option value="">Tahun</option>
            {filterOptions.tahuns?.map((tahun) => (
              <option key={tahun} value={tahun}>{tahun}</option>
            )) || []}
          </select>
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
                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">
                  MULAI
                </th>
                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">SELESAI</th>
                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">RENCANA</th>
                <th className="border border-gray-800 bg-gray-200 px-2 py-1 text-center align-middle font-semibold">REALISASI</th>
              </tr>
            </thead>
            <tbody>
              {risks.data?.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-100 transition-colors">
                  <td className="border border-gray-800 px-2 py-1 text-center align-middle">{(risks.current_page - 1) * risks.per_page + index + 1}</td>
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
              )) || <tr><td colSpan={16} className="border border-gray-800 px-2 py-1 text-center text-gray-500">No data available</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Export Buttons - Centered and Styled */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            onClick={exportPdf}
          >
            Export PDF
          </button>
          <button
            className="rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
            onClick={exportExcel}
          >
            Export Excel
          </button>
        </div>

        {/* Pagination - Centered and Styled */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            className="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50"
            onClick={() => router.get('/laporan/risk-detail', { ...filters, page: risks.current_page - 1 }, { preserveState: true })}
            disabled={risks.current_page === 1 || !risks.data?.length}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">Page {risks.current_page || 1} of {risks.last_page || 1}</span>
          <button
            className="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors disabled:opacity-50"
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
    </AppLayout>
  );
};

export default Index;
