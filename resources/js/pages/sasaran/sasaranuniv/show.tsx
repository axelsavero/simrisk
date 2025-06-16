import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SasaranUniv } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Download, Eye, FileText, FileX, Info, Paperclip, Pencil, Undo2 } from 'lucide-react';

interface Props {
    sasaranUniv: SasaranUniv;
}

export default function Show({ sasaranUniv }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sasaran Universitas', href: route('sasaran-univ.index') },
        { title: 'Detail Dokumen', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Sasaran Universitas" />

            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Detail Sasaran Universitas</h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('sasaran-univ.edit', sasaranUniv.id_sasaran_univ)}
                            className="flex items-center gap-2 rounded-md bg-yellow-600 px-6 py-3 font-medium text-white transition hover:bg-yellow-700"
                        >
                            <Pencil />
                            Edit
                        </Link>
                        <Link
                            href={route('sasaran-univ.index')}
                            className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <Undo2 />
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
                    {/* Header Info */}
                    <div className="mb-8 border-b pb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <FileText className="text-3xl" />
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{sasaranUniv.nama_dokumen || 'Dokumen Sasaran Universitas'}</h3>
                                <p className="text-sm text-gray-500">
                                    ID: {sasaranUniv.id_sasaran_univ} • Dibuat: {new Date(sasaranUniv.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{sasaranUniv.kategori}</div>
                    </div>

                    {/* Detail Information */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Informasi Dokumen */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <ClipboardList size={30} /> 
                                <h4 className="border-b pb-2 text-lg font-semibold text-gray-900">Informasi Dokumen</h4>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <p className="mt-1 text-sm text-gray-900">{sasaranUniv.kategori}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900">{sasaranUniv.nama_dokumen || '-'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900">{sasaranUniv.nomor_dokumen || '-'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {sasaranUniv.tanggal_dokumen
                                        ? new Date(sasaranUniv.tanggal_dokumen).toLocaleDateString('id-ID', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        {/* File Information */}
                        <div className="w-full space-y-4 md:col-span-1">
                            <div className='flex gap-3'>
                                <Paperclip size={28} />
                                <h4 className="border-b pb-2 text-lg font-semibold text-gray-900">File Dokumen</h4>
                            </div>

                            {sasaranUniv.file_path ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText />
                                            <div>
                                                <p className="font-medium break-all text-green-800">{sasaranUniv.file_path.split('/').pop()}</p>
                                                <p className="text-sm text-green-600">File tersedia</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/storage/${sasaranUniv.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title='Detail'
                                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                            >
                                                <Eye size={24} />
                                            </a>
                                            <a
                                                href={`/storage/${sasaranUniv.file_path}`}
                                                title='Download'
                                                download
                                                className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                            >
                                                <Download size={24} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                                    <FileX size={28} className='text-gray-400' />
                                    <p className="mt-2 text-sm text-gray-500">Tidak ada file yang diupload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-8 border-t pt-6">
                        <div className='flex gap-2'>
                            <Info size={28} />
                            <h4 className="mb-4 text-lg font-semibold text-gray-900">Informasi Sistem</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dibuat pada</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(sasaranUniv.created_at).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Terakhir diupdate</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(sasaranUniv.updated_at).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
