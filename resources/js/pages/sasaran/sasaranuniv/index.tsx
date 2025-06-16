// resources/js/pages/sasaran/sasaranuniv/index.tsx

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, File, FilePlus, FileText, ScanSearch, SquarePen, Trash2, X } from 'lucide-react';

interface SasaranUniv {
    id_sasaran_univ: number;
    kategori: string;
    nama_dokumen?: string;
    nomor_dokumen?: string;
    tanggal_dokumen?: string;
    file_path?: string;
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    sasaranUnivs: {
        data: SasaranUniv[];
        links?: any[];
        meta?: any;
        total?: number;
        current_page?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    debug?: {
        total: number;
        current_page: number;
        has_data: boolean;
    };
    error?: string;
}

export default function Index({ sasaranUnivs, flash, debug, error }: IndexProps) {
    // Debug log
    console.log('Props received:', { sasaranUnivs, flash, debug, error });

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(route('sasaran-univ.destroy', id));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sasaran Universitas', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Sasaran Universitas" />

            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Data Sasaran Universitas</h2>
                    <Link
                        href={route('sasaran-univ.create')}
                        className="flex items-center gap-2 rounded-md bg-[#12745A] px-6 py-3 font-medium text-white transition hover:bg-green-900"
                    >
                        <FilePlus />
                        Tambah Dokumen
                    </Link>
                </div>
                {/* Debug Info - Hapus setelah debugging */}
                {debug && (
                    <div className="mb-4 rounded border border-yellow-300 bg-yellow-100 p-4">
                        <h3 className="font-bold">Debug Info:</h3>
                        <p>Total: {debug.total}</p>
                        <p>Current Page: {debug.current_page}</p>
                        <p>Has Data: {debug.has_data ? 'Yes' : 'No'}</p>
                        <p>Data Array Length: {sasaranUnivs?.data?.length || 0}</p>
                    </div>
                )}
                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <div className="flex">
                            <X className="text-red-600" />
                            <p className="ml-3 text-sm text-red-700">Error: {error}</p>
                        </div>
                    </div>
                )}
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 rounded-lg border-l-4 border-green-400 bg-green-50 p-4">
                        <div className="flex">
                            <CircleCheck className="text-green-600" />
                            <p className="ml-3 text-sm text-green-700">{flash.success}</p>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <div className="flex">
                            <X className="text-red-600" />
                            <p className="ml-3 text-sm text-red-700">{flash.error}</p>
                        </div>
                    </div>
                )}
                {/* Data Check and Table */}
                <div className="rounded-xl border-2 border-gray-300 bg-white shadow-md">
                    {/* Check if sasaranUnivs exists */}
                    {!sasaranUnivs ? (
                        <div className="p-8 text-center">
                            <p className="text-red-500">Error: Data sasaranUnivs tidak ditemukan</p>
                        </div>
                    ) : !sasaranUnivs.data ? (
                        <div className="p-8 text-center">
                            <p className="text-red-500">Error: sasaranUnivs.data tidak ditemukan</p>
                        </div>
                    ) : sasaranUnivs.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex flex-col items-center">
                                <File size={48} className="mb-2 text-gray-400" />
                                <p className="text-lg font-medium">Belum ada data sasaran universitas</p>
                                <p className="mb-4 text-sm text-gray-600">Klik tombol "Tambah Dokumen" untuk menambahkan data baru</p>
                                <Link href={route('sasaran-univ.create')} className="rounded-md bg-[#12745A] px-4 py-2 text-white hover:bg-green-900">
                                    Tambah Data Pertama
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Nama Dokumen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Nomor Dokumen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">File</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {sasaranUnivs.data.map((item, index) => (
                                        <tr key={item.id_sasaran_univ || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{item.id_sasaran_univ}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800">
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.nama_dokumen || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.nomor_dokumen || '-'}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                {item.tanggal_dokumen ? new Date(item.tanggal_dokumen).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.file_path ? (
                                                    <a
                                                        href={`/storage/${item.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FileText />
                                                        Lihat File
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">Tidak ada file</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('sasaran-univ.show', item.id_sasaran_univ)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-colors hover:bg-blue-500 hover:text-white"
                                                        title="Detail"
                                                    >
                                                        <ScanSearch size={20} />
                                                    </Link>
                                                    <Link
                                                        href={route('sasaran-univ.edit', item.id_sasaran_univ)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 transition-colors hover:bg-yellow-400 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <SquarePen size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id_sasaran_univ)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 transition-colors hover:bg-red-500 hover:text-white"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {sasaranUnivs.links && sasaranUnivs.links.length > 3 && (
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="text-sm text-gray-700">
                                        Menampilkan {sasaranUnivs.data.length} dari {sasaranUnivs.total} entri
                                    </div>
                                    <div className="flex space-x-2">
                                        {sasaranUnivs.links.map((link: any, index: number) => {
                                            if (!link.url) {
                                                return (
                                                    <span key={index} className="rounded-md border bg-gray-100 px-3 py-2 text-sm text-gray-400">
                                                        {link.label === '&laquo; Previous' ? '«' : link.label === 'Next &raquo;' ? '»' : link.label}
                                                    </span>
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                                                        link.active
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            link.label === '&laquo; Previous'
                                                                ? '«'
                                                                : link.label === 'Next &raquo;'
                                                                  ? '»'
                                                                  : link.label,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
