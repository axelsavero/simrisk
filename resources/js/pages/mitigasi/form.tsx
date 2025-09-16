import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Calendar,
    DollarSign,
    User,
    FileText,
    Target
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface PageProps {
    identifyRisks: IdentifyRisk[];
    selectedRiskId?: string;
    statusOptions: Record<string, string>;
    strategiOptions: Record<string, string>;
    mitigasi?: {
        id: number;
        identify_risk_id: string;
        judul_mitigasi: string;
        deskripsi_mitigasi: string;
        strategi_mitigasi: string;
        pic_mitigasi: string;
        target_selesai: string;
        biaya_mitigasi: string;
        status_mitigasi: string;
        progress_percentage: number;
        catatan_progress: string;
        bukti_implementasi: Array<{
            original_name: string;
            file_name: string;
            file_path: string;
            file_size: number;
            file_extension: string;
            uploaded_at: string;
        }>;
        evaluasi_efektivitas: string;
        rekomendasi_lanjutan: string;
    };
}

interface MitigasiFormData {
    id?: number;
    identify_risk_id: string;
    judul_mitigasi: string;
    deskripsi_mitigasi: string;
    strategi_mitigasi: string;
    pic_mitigasi: string;
    target_selesai: string;
    biaya_mitigasi: string;
    status_mitigasi: string;
    progress_percentage: number;
    catatan_progress: string;
    bukti_implementasi: File[];
    evaluasi_efektivitas: string;
    rekomendasi_lanjutan: string;
}

const getBreadcrumbs = (isEdit: boolean): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Mitigasi', href: '/mitigasi' },
    { title: isEdit ? 'Edit Mitigasi' : 'Tambah Mitigasi', href: isEdit ? '#' : '/mitigasi/create' },
];

export default function Create() {
    const { identifyRisks, selectedRiskId, statusOptions, strategiOptions } = usePage<PageProps>().props;
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { mitigasi } = usePage<PageProps>().props;

    const { data, setData, processing, errors } = useForm<MitigasiFormData>({
        id: mitigasi?.id,
        identify_risk_id: mitigasi?.identify_risk_id || selectedRiskId || '',
        judul_mitigasi: mitigasi?.judul_mitigasi || '',
        deskripsi_mitigasi: mitigasi?.deskripsi_mitigasi || '',
        strategi_mitigasi: mitigasi?.strategi_mitigasi || '',
        pic_mitigasi: mitigasi?.pic_mitigasi || '',
        target_selesai: mitigasi?.target_selesai || '',
        biaya_mitigasi: mitigasi?.biaya_mitigasi || '',
        status_mitigasi: mitigasi?.status_mitigasi || 'belum_dimulai',
        progress_percentage: mitigasi?.progress_percentage || 0,
        catatan_progress: mitigasi?.catatan_progress || '',
        bukti_implementasi: [],
        evaluasi_efektivitas: mitigasi?.evaluasi_efektivitas || '',
        rekomendasi_lanjutan: mitigasi?.rekomendasi_lanjutan || ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
        setData('bukti_implementasi', [...selectedFiles, ...files]);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('bukti_implementasi', newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'bukti_implementasi') {
                selectedFiles.forEach((file, index) => {
                    formData.append(`bukti_implementasi[${index}]`, file);
                });
            } else {
                formData.append(key, value?.toString() || '');
            }
        });

        router.post('/mitigasi', formData, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Mitigasi berhasil dibuat.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.visit('/mitigasi');
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Gagal membuat mitigasi. Periksa kembali data yang dimasukkan.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const formatCurrency = (value: string) => {
        const number = value.replace(/[^\d]/g, '');
        return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        setData('biaya_mitigasi', value);
    };

    const isEdit = Boolean(mitigasi);
    const currentBreadcrumbs = getBreadcrumbs(isEdit);

    return (
        <AppLayout breadcrumbs={currentBreadcrumbs}>
            <Head title={mitigasi ? 'Edit Mitigasi' : 'Tambah Mitigasi'} />

            <div className="w-full min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {mitigasi ? 'Edit Mitigasi' : 'Tambah Mitigasi Baru'}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {mitigasi
                                    ? 'Ubah rencana mitigasi yang sudah ada'
                                    : 'Buat rencana mitigasi untuk mengelola risiko yang telah diidentifikasi'}
                            </p>
                        </div>
                        <Link
                            href="/mitigasi"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {/* Identify Risk */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Risiko Terkait <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.identify_risk_id}
                                    onChange={(e) => setData('identify_risk_id', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.identify_risk_id ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Pilih Risiko</option>
                                    {identifyRisks.map((risk) => (
                                        <option key={risk.id} value={risk.id}>
                                            {risk.id_identify} - {risk.description}
                                        </option>
                                    ))}
                                </select>
                                {errors.identify_risk_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.identify_risk_id}</p>
                                )}
                            </div>

                            {/* Judul Mitigasi */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Judul Mitigasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.judul_mitigasi}
                                    onChange={(e) => setData('judul_mitigasi', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.judul_mitigasi ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan judul mitigasi"
                                    required
                                />
                                {errors.judul_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.judul_mitigasi}</p>
                                )}
                            </div>

                            {/* Deskripsi Mitigasi */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi Mitigasi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.deskripsi_mitigasi}
                                    onChange={(e) => setData('deskripsi_mitigasi', e.target.value)}
                                    rows={4}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.deskripsi_mitigasi ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Jelaskan detail rencana mitigasi"
                                    required
                                />
                                {errors.deskripsi_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deskripsi_mitigasi}</p>
                                )}
                            </div>

                            {/* Strategi Mitigasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Strategi Mitigasi <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.strategi_mitigasi}
                                    onChange={(e) => setData('strategi_mitigasi', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.strategi_mitigasi ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Pilih Strategi</option>
                                    {Object.entries(strategiOptions).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {errors.strategi_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.strategi_mitigasi}</p>
                                )}
                            </div>

                            {/* PIC Mitigasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    PIC (Person In Charge) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={data.pic_mitigasi}
                                        onChange={(e) => setData('pic_mitigasi', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.pic_mitigasi ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nama penanggung jawab"
                                        required
                                    />
                                </div>
                                {errors.pic_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.pic_mitigasi}</p>
                                )}
                            </div>

                            {/* Target Selesai */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Selesai <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={data.target_selesai}
                                        onChange={(e) => setData('target_selesai', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.target_selesai ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                </div>
                                {errors.target_selesai && (
                                    <p className="mt-1 text-sm text-red-600">{errors.target_selesai}</p>
                                )}
                            </div>

                            {/* Biaya Mitigasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Biaya Mitigasi (Opsional)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={data.biaya_mitigasi ? formatCurrency(data.biaya_mitigasi) : ''}
                                        onChange={handleCurrencyChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.biaya_mitigasi ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="0"
                                    />
                                </div>
                                {errors.biaya_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.biaya_mitigasi}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status and Progress */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Status dan Progress</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {/* Status Mitigasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Mitigasi
                                </label>
                                <select
                                    value={data.status_mitigasi}
                                    onChange={(e) => setData('status_mitigasi', e.target.value)}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.status_mitigasi ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    {Object.entries(statusOptions).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {errors.status_mitigasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status_mitigasi}</p>
                                )}
                            </div>

                            {/* Progress Percentage */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Progress (%)
                                </label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progress_percentage}
                                        onChange={(e) => setData('progress_percentage', parseInt(e.target.value) || 0)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.progress_percentage ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="0"
                                    />
                                </div>
                                {errors.progress_percentage && (
                                    <p className="mt-1 text-sm text-red-600">{errors.progress_percentage}</p>
                                )}
                            </div>

                            {/* Catatan Progress */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan Progress
                                </label>
                                <textarea
                                    value={data.catatan_progress}
                                    onChange={(e) => setData('catatan_progress', e.target.value)}
                                    rows={3}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.catatan_progress ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Catatan mengenai progress implementasi mitigasi"
                                />
                                {errors.catatan_progress && (
                                    <p className="mt-1 text-sm text-red-600">{errors.catatan_progress}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Files and Documentation */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Dokumentasi</h2>

                        <div className="space-y-6 w-full">
                            {/* Bukti Implementasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bukti Implementasi
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md w-full">
                                    <div className="space-y-1 text-center w-full">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload files</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="sr-only"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                />
                                            </label>
                                            <p className="pl-1">atau drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PDF, DOC, DOCX, JPG, PNG up to 10MB
                                        </p>
                                    </div>
                                </div>

                                {/* Selected Files */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">File yang dipilih:</h4>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded w-full">
                                                    <div className="flex items-center">
                                                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.bukti_implementasi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.bukti_implementasi}</p>
                                )}
                            </div>

                            {/* Evaluasi Efektivitas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Evaluasi Efektivitas
                                </label>
                                <textarea
                                    value={data.evaluasi_efektivitas}
                                    onChange={(e) => setData('evaluasi_efektivitas', e.target.value)}
                                    rows={3}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.evaluasi_efektivitas ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Evaluasi efektivitas mitigasi yang telah diimplementasikan"
                                />
                                {errors.evaluasi_efektivitas && (
                                    <p className="mt-1 text-sm text-red-600">{errors.evaluasi_efektivitas}</p>
                                )}
                            </div>

                            {/* Rekomendasi Lanjutan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rekomendasi Lanjutan
                                </label>
                                <textarea
                                    value={data.rekomendasi_lanjutan}
                                    onChange={(e) => setData('rekomendasi_lanjutan', e.target.value)}
                                    rows={3}
                                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.rekomendasi_lanjutan ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Rekomendasi untuk tindak lanjut atau perbaikan mitigasi"
                                />
                                {errors.rekomendasi_lanjutan && (
                                    <p className="mt-1 text-sm text-red-600">{errors.rekomendasi_lanjutan}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link
                            href="/mitigasi"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Mitigasi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
