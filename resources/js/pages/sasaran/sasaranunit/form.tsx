import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SasaranUniv } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { CircleCheck, FileText, Hourglass, Lightbulb, Paperclip, Save, X } from 'lucide-react';

interface FormProps {
    sasaranUnit?: any | null;
    sasaranUnivs?: Pick<SasaranUniv, 'id_sasaran_univ' | 'kategori' | 'nama_dokumen'>[];
}

interface FormData {
    [key: string]: any;
    id_sasaran_univ: number | '';
    kategori: string;
    nama_dokumen: string;
    nomor_dokumen: string;
    tanggal_dokumen: string;
    file: File | null;
    _method?: string;
}

export default function Form({ sasaranUnit = null, sasaranUnivs = [] }: FormProps) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm<FormData>({
        id_sasaran_univ: (sasaranUnit as any)?.id_sasaran_univ ?? '',
        kategori: sasaranUnit?.kategori || '',
        nama_dokumen: sasaranUnit?.nama_dokumen || '',
        nomor_dokumen: sasaranUnit?.nomor_dokumen || '',
        tanggal_dokumen: sasaranUnit?.tanggal_dokumen || new Date().toISOString().split('T')[0],
        file: null,
        _method: sasaranUnit ? 'PUT' : 'POST',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        console.log('Submitting data:', {
            ...data,
            file: data.file ? `File: ${data.file.name}` : 'No file',
            sasaranUnitId: sasaranUnit?.id_sasaran_unit,
        });

        if (sasaranUnit) {
            post(route('sasaran-unit.update', sasaranUnit.id_sasaran_unit), {
                forceFormData: true,
                onBefore: () => {
                    console.log('Before update request');
                },
                onSuccess: () => {
                    console.log('Update successful');
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                },
            });
        } else {
            post(route('sasaran-unit.store'), {
                forceFormData: true,
                onBefore: () => {
                    console.log('Before create request');
                },
                onSuccess: () => {
                    console.log('Create successful');
                },
                onError: (errors) => {
                    console.error('Create errors:', errors);
                },
            });
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sasaran Unit', href: route('sasaran-unit.index') },
        { title: sasaranUnit ? 'Edit Dokumen' : 'Tambah Dokumen', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={sasaranUnit ? 'Edit Sasaran Unit' : 'Tambah Sasaran Unit Baru'} />
            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{sasaranUnit ? 'Edit Sasaran Unit' : 'Tambah Sasaran Unit Baru'}</h2>
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

                {sasaranUnit && (
                    <div className="mb-4 rounded border border-yellow-300 bg-yellow-100 p-3 text-sm">
                        <strong>Debug:</strong> Editing ID {sasaranUnit.id_sasaran_unit} | Method: {data._method}
                    </div>
                )}

                {!sasaranUnit && (
                    <div className="mb-6 rounded-lg border-l-4 border-[#12745A] bg-blue-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Lightbulb className="text-lg text-green-900" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    <strong>Info:</strong> Silakan lengkapi data dokumen sasaran unit di bawah ini. Pastikan semua informasi
                                    yang dimasukkan akurat.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md"
                    encType="multipart/form-data"
                >
                    {sasaranUnit && <input type="hidden" name="_method" value="PUT" />}

                    <div>
                        <label className="mb-1 block font-medium">Sasaran Universitas Terkait *</label>
                        <select
                            value={data.id_sasaran_univ}
                            onChange={(e) => setData('id_sasaran_univ', e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Pilih Sasaran Universitas</option>
                            {sasaranUnivs.map((su) => (
                                <option key={su.id_sasaran_univ} value={su.id_sasaran_univ}>
                                    {su.id_sasaran_univ} - {su.kategori} {su.nama_dokumen ? `(${su.nama_dokumen})` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.id_sasaran_univ && <div className="mt-1 text-sm text-red-500">{String(errors.id_sasaran_univ)}</div>}
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Kategori Dokumen *</label>
                        <select
                            value={data.kategori}
                            onChange={(e) => setData('kategori', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="Visi Misi">Visi Misi</option>
                            <option value="Rencana Strategis">Rencana Strategis</option>
                            <option value="Sasaran Strategis">Sasaran Strategis</option>
                            <option value="Indikator Kinerja">Indikator Kinerja</option>
                            <option value="Program Kerja">Program Kerja</option>
                            <option value="Evaluasi">Evaluasi</option>
                        </select>
                        {errors.kategori && <div className="mt-1 text-sm text-red-500">{errors.kategori}</div>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">Nama Dokumen</label>
                            <input
                                type="text"
                                value={data.nama_dokumen}
                                onChange={(e) => setData('nama_dokumen', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Masukkan nama dokumen"
                            />
                            {errors.nama_dokumen && <div className="mt-1 text-sm text-red-500">{errors.nama_dokumen}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Nomor Dokumen</label>
                            <input
                                type="text"
                                value={data.nomor_dokumen}
                                onChange={(e) => setData('nomor_dokumen', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Masukkan nomor dokumen"
                            />
                            {errors.nomor_dokumen && <div className="mt-1 text-sm text-red-500">{errors.nomor_dokumen}</div>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">Tanggal Dokumen</label>
                        <input
                            type="date"
                            value={data.tanggal_dokumen}
                            onChange={(e) => setData('tanggal_dokumen', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.tanggal_dokumen && <div className="mt-1 text-sm text-red-500">{errors.tanggal_dokumen}</div>}
                    </div>

                    <div className="border-t-2 pt-6">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <Paperclip />
                                Upload Dokumen
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                                Upload file dokumen sasaran unit (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG)
                            </p>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">File Dokumen</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-blue-100 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                />
                                {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                                <p className="mt-1 text-xs text-gray-500">
                                    Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG (Maksimal: 10MB)
                                </p>
                            </div>

                            {data.file && (
                                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-500">📄</span>
                                        <span className="text-sm font-medium text-green-500">File dipilih: {data.file.name}</span>
                                        <span className="text-xs text-green-500">({Math.round(data.file.size / 1024)} KB)</span>
                                    </div>
                                </div>
                            )}

                            {sasaranUnit?.file_path && (
                                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className='text-green-600' />
                                        <span className="text-sm font-medium text-green-800">
                                            File saat ini: {sasaranUnit.file_path.split('/').pop()}
                                        </span>
                                        <a
                                            href={`/storage/${sasaranUnit.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-600 hover:text-green-800"
                                        >
                                            Lihat File
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-md bg-[#12745A] px-8 py-3 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Hourglass className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save />
                                    {sasaranUnit ? 'Update Dokumen' : 'Simpan Dokumen'}
                                </>
                            )}
                        </button>

                        <Link
                            href={route('sasaran-unit.index')}
                            className="flex items-center gap-2 rounded-md border border-gray-300 bg-red-500 px-8 py-3 font-medium text-gray-100 transition hover:bg-red-700"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
