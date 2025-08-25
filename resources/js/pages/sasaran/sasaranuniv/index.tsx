// resources/js/pages/sasaran/sasaranuniv/index.tsx

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, File, FilePlus, FileText, ScanSearch, SquarePen, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

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
}

export default function Index({ sasaranUnivs, flash }: IndexProps) {
    const [sortField, setSortField] = useState<'id_sasaran_univ' | 'kategori' | 'nama_dokumen' | 'nomor_dokumen' | 'tanggal_dokumen'>(
        'id_sasaran_univ',
    );
    const [sortOrderAsc, setSortOrderAsc] = useState(true); // default: ID DESC

    const handleSort = (field: typeof sortField) => {
        if (field === sortField) {
            setSortOrderAsc(!sortOrderAsc);
        } else {
            setSortField(field);
            setSortOrderAsc(true);
        }
    };

    const sortedData = [...sasaranUnivs.data].sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';

        if (sortField === 'id_sasaran_univ') {
            return sortOrderAsc ? a.id_sasaran_univ - b.id_sasaran_univ : b.id_sasaran_univ - a.id_sasaran_univ;
        }

        return sortOrderAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: 'Yakin ingin menghapus data ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('sasaran-univ.destroy', id));
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sasaran Universitas', href: '#' },
    ];

    const headerClass = 'cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase border border-black';

    const renderSortArrow = (field: typeof sortField) => (sortField === field ? (sortOrderAsc ? '▲' : '▼') : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Sasaran Universitas" />
            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Data Sasaran Universitas</h2>
                    {/* Tombol tambah dokumen hanya muncul di pojok kanan atas jika ADA data */}
                    {sortedData.length > 0 && (
                        <Link
                            href={route('sasaran-univ.create')}
                            className="flex items-center gap-2 rounded-md bg-[#12745A] px-2 py-2 font-medium text-sm text-white transition hover:bg-green-900"
                        >
                            <FilePlus />
                            Tambah Dokumen
                        </Link>
                    )}
                </div>

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

                {/* TAMPILAN JIKA DATA KOSONG */}
                {sortedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <File className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-700">Dokumen masih kosong</h3>
                        <p className="mb-6 text-gray-500">Silakan tambahkan dokumen terlebih dahulu untuk mulai mengelola sasaran universitas.</p>
                        {/* Tombol tambah dokumen di tengah jika data kosong */}
                        <Link
                            href={route('sasaran-univ.create')}
                            className="flex items-center gap-2 rounded-md bg-[#12745A] px-6 py-3 font-medium text-white transition hover:bg-green-900"
                        >
                            <FilePlus />
                            Tambah Dokumen
                        </Link>
                    </div>
                ) : (
                    <div className="border-sidebar-border overflow-hidden rounded-xl border bg-white shadow-sm">
                        <div className='overflow-x-auto p-4'>
                            <div className="overflow-x-auto border-2 border-gray-300 bg-white shadow-md">
                                <table className="w-full border-black">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th onClick={() => handleSort('id_sasaran_univ')} className={headerClass}>
                                                ID {renderSortArrow('id_sasaran_univ')}
                                            </th>
                                            <th onClick={() => handleSort('kategori')} className={headerClass}>
                                                Kategori {renderSortArrow('kategori')}
                                            </th>
                                            <th onClick={() => handleSort('nama_dokumen')} className={headerClass}>
                                                Nama Dokumen {renderSortArrow('nama_dokumen')}
                                            </th>
                                            <th onClick={() => handleSort('nomor_dokumen')} className={headerClass}>
                                                Nomor Dokumen {renderSortArrow('nomor_dokumen')}
                                            </th>
                                            <th onClick={() => handleSort('tanggal_dokumen')} className={headerClass}>
                                                Tanggal {renderSortArrow('tanggal_dokumen')}
                                            </th>
                                            <th className={headerClass}>File</th>
                                            <th className={headerClass}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white border border-black">
                                        {sortedData.map((item) => (
                                            <tr key={item.id_sasaran_univ} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900 border border-black">{item.id_sasaran_univ}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 border border-black">
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                                                        {item.kategori}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 border border-black">{item.nama_dokumen || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 border border-black">{item.nomor_dokumen || '-'}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 border border-black">
                                                    {item.tanggal_dokumen ? new Date(item.tanggal_dokumen).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-blue-600 border border-black">
                                                    {item.file_path ? (
                                                        <a
                                                            href={`/storage/${item.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 hover:text-blue-800"
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
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white"
                                                            title="Detail"
                                                        >
                                                            <ScanSearch size={20} />
                                                        </Link>
                                                        <Link
                                                            href={route('sasaran-univ.edit', item.id_sasaran_univ)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-400 hover:text-white"
                                                            title="Edit"
                                                        >
                                                            <SquarePen size={20} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id_sasaran_univ)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-500 hover:text-white"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
