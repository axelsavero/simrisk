import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Mitigasi } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileText, Pause, Target, Trash2, TrendingUp, User, Wallet, XCircle } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface PageProps {
    mitigasi: (Mitigasi & { probability?: number; impact?: number }) | null;
    statusOptions?: Record<string, string>;
    strategiOptions?: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Mitigasi', href: '/mitigasi' },
    { title: 'Detail Mitigasi', href: '#' },
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'belum_dimulai':
            return <Clock className="h-5 w-5 text-gray-500" />;
        case 'sedang_berjalan':
            return <TrendingUp className="h-5 w-5 text-blue-500" />;
        case 'selesai':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'tertunda':
            return <Pause className="h-5 w-5 text-yellow-500" />;
        case 'dibatalkan':
            return <XCircle className="h-5 w-5 text-red-500" />;
        default:
            return <Clock className="h-5 w-5 text-gray-500" />;
    }
};

const getStatusBadge = (status: string, label: string) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
        case 'belum_dimulai':
            return `${baseClasses} bg-gray-100 text-gray-800`;
        case 'sedang_berjalan':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'selesai':
            return `${baseClasses} bg-green-100 text-green-800`;
        case 'tertunda':
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'dibatalkan':
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const getStrategiBadge = (strategi: string, label: string) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (strategi) {
        case 'avoid':
            return `${baseClasses} bg-red-100 text-red-800`;
        case 'reduce':
            return `${baseClasses} bg-orange-100 text-orange-800`;
        case 'transfer':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'accept':
            return `${baseClasses} bg-green-100 text-green-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const getValidationStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
        case 'draft':
            return `${baseClasses} bg-gray-100 text-gray-800`;
        case 'submitted':
        case 'pending':
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'approved':
            return `${baseClasses} bg-green-100 text-green-800`;
        case 'rejected':
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const getValidationStatusLabel = (status: string) => {
    switch (status) {
        case 'draft':
            return 'Draft';
        case 'submitted':
        case 'pending':
            return 'Menunggu Persetujuan';
        case 'approved':
            return 'Disetujui';
        case 'rejected':
            return 'Butuh Revisi';
        default:
            return 'Tidak Diketahui';
    }
};

const getRiskLevelText = (level: number) => {
    if (level >= 20) return 'Tinggi';
    if (level >= 9) return 'Sedang';
    if (level >= 3) return 'Rendah';
    return 'Sangat Rendah';
};

const getRiskLevelColor = (level: number) => {
    if (level >= 20) return 'text-red-600 bg-red-100';
    if (level >= 9) return 'text-orange-600 bg-orange-100';
    if (level >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
};

export default function Show() {
    const { mitigasi, statusOptions = {}, strategiOptions = {}, auth }: any = usePage<any>().props;
    const roles: string[] = auth?.user?.roles || [];
    const isOwnerRisk = roles.includes('owner-risk');

    if (!mitigasi) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-4 text-center text-red-500">Data mitigasi tidak ditemukan.</div>
            </AppLayout>
        );
    }

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressData, setProgressData] = useState({
        progress_percentage: mitigasi.progress_percentage,
        catatan_progress: mitigasi.catatan_progress || '',
    });

    const riskLevel = (mitigasi.probability || 1) * (mitigasi.impact || 1);

    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Mitigasi?',
            text: `Apakah Anda yakin ingin menghapus mitigasi "${mitigasi.judul_mitigasi}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/mitigasi/${mitigasi.id}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Mitigasi berhasil dihapus.', 'success');
                        router.visit('/mitigasi');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus mitigasi.', 'error');
                    },
                });
            }
        });
    };

    const handleProgressUpdate = () => {
        router.patch(`/mitigasi/${mitigasi.id}/progress`, progressData, {
            onSuccess: () => {
                setShowProgressModal(false);
                Swal.fire('Berhasil!', 'Progress berhasil diperbarui.', 'success');
            },
            onError: () => {
                Swal.fire('Error!', 'Gagal memperbarui progress.', 'error');
            },
            preserveScroll: true,
        });
    };

    const handleDownloadBukti = (filename: string) => {
        window.open(`/mitigasi/${mitigasi.id}/bukti/${filename}`, '_blank');
    };

    const handleRemoveBukti = (filename: string) => {
        Swal.fire({
            title: 'Hapus File?',
            text: `Apakah Anda yakin ingin menghapus file "${filename}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/mitigasi/${mitigasi.id}/bukti/${filename}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'File berhasil dihapus.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus file.', 'error');
                    },
                });
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOverdue = (targetDate: string, status: string) => {
        return new Date(targetDate) < new Date() && !['selesai', 'dibatalkan'].includes(status);
    };

    const getDaysUntilTarget = (targetDate: string) => {
        const target = new Date(targetDate);
        const today = new Date();
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilTarget = mitigasi.target_selesai ? getDaysUntilTarget(mitigasi.target_selesai) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Mitigasi - ${mitigasi.judul_mitigasi || 'Unknown'}`} />

            <div className="mx-auto mt-6 max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/mitigasi"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{mitigasi.judul_mitigasi || 'No Title'}</h1>
                            <p className="mt-1 text-sm text-gray-600">ID Risiko: {mitigasi.identify_risk?.id_identify || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-3 sm:mt-0">
                        {isOwnerRisk && (
                            <button
                                onClick={() => setShowProgressModal(true)}
                                className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100"
                            >
                                <Target className="mr-2 h-4 w-4" />
                                Update Progress
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center">
                            {getStatusIcon(mitigasi.status_mitigasi || 'belum_dimulai')}
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <span
                                    className={getStatusBadge(
                                        mitigasi.status_mitigasi || 'belum_dimulai',
                                        mitigasi.status_label || statusOptions[mitigasi.status_mitigasi],
                                    )}
                                >
                                    {mitigasi.status_label || statusOptions[mitigasi.status_mitigasi]}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center">
                            <Target className="h-5 w-5 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Progress</p>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${mitigasi.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{mitigasi.progress_percentage || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Target Selesai</p>
                                <p
                                    className={`text-sm font-medium ${
                                        mitigasi.target_selesai && isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi || 'belum_dimulai')
                                            ? 'text-red-600'
                                            : mitigasi.target_selesai && daysUntilTarget <= 7 && daysUntilTarget > 0
                                              ? 'text-yellow-600'
                                              : 'text-gray-900'
                                    }`}
                                >
                                    {mitigasi.target_selesai ? formatDate(mitigasi.target_selesai) : 'N/A'}
                                </p>
                                {mitigasi.target_selesai && isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi || 'belum_dimulai') ? (
                                    <p className="text-xs text-red-500">Terlambat {Math.abs(daysUntilTarget)} hari</p>
                                ) : mitigasi.target_selesai && daysUntilTarget <= 7 && daysUntilTarget > 0 ? (
                                    <p className="text-xs text-yellow-500">{daysUntilTarget} hari lagi</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center">
                            <Wallet className="h-5 w-5 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Biaya</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {mitigasi.biaya_mitigasi ? formatCurrency(mitigasi.biaya_mitigasi) : 'Tidak ditentukan'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Informasi Mitigasi</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Deskripsi Mitigasi</label>
                                    <p className="mt-1 text-sm text-gray-900">{mitigasi.deskripsi_mitigasi || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Strategi Mitigasi</label>
                                        <span
                                            className={`mt-1 ${getStrategiBadge(mitigasi.strategi_mitigasi || 'accept', mitigasi.strategi_label || strategiOptions[mitigasi.strategi_mitigasi] || 'Menerima')}`}
                                        >
                                            {mitigasi.strategi_label || strategiOptions[mitigasi.strategi_mitigasi] || 'Menerima'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">PIC (Person In Charge)</label>
                                        <div className="mt-1 flex items-center">
                                            <User className="mr-2 h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">{mitigasi.pic_mitigasi || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status Validasi</label>
                                    <span className={`mt-1 ${getValidationStatusBadge(mitigasi.validation_status || 'draft')}`}>
                                        {getValidationStatusLabel(mitigasi.validation_status || 'draft')}
                                    </span>
                                </div>
                                {mitigasi.validation_status === 'rejected' && mitigasi.rejection_reason && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Alasan Revisi</label>
                                        <p className="mt-1 text-sm text-red-600">{mitigasi.rejection_reason}</p>
                                    </div>
                                )}
                                {mitigasi.catatan_progress && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Catatan Progress</label>
                                        <p className="mt-1 text-sm text-gray-900">{mitigasi.catatan_progress}</p>
                                    </div>
                                )}
                                {mitigasi.evaluasi_efektivitas && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Evaluasi Efektivitas</label>
                                        <p className="mt-1 text-sm text-gray-900">{mitigasi.evaluasi_efektivitas}</p>
                                    </div>
                                )}
                                {mitigasi.rekomendasi_lanjutan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Rekomendasi Lanjutan</label>
                                        <p className="mt-1 text-sm text-gray-900">{mitigasi.rekomendasi_lanjutan}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Analisis Risiko</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border p-4">
                                    <label className="block text-sm font-medium text-gray-500">Probabilitas</label>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{mitigasi.probability || 'N/A'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <label className="block text-sm font-medium text-gray-500">Dampak</label>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{mitigasi.impact || 'N/A'}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <label className="block text-sm font-medium text-gray-500">Level Risiko</label>
                                    <div className={`mt-1 inline-block rounded-lg px-3 py-1 text-sm font-semibold ${getRiskLevelColor(riskLevel)}`}>
                                        {getRiskLevelText(riskLevel)} ({riskLevel}/25)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Informasi Risiko Terkait</h2>
                            {mitigasi.identify_risk ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">ID Risiko</label>
                                            <p className="mt-1 text-sm text-gray-900">{mitigasi.identify_risk.id_identify}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Unit Kerja</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {mitigasi.identify_risk?.user?.unit?.nama_unit ??
                                                    mitigasi.identify_risk?.user?.unit ??
                                                    mitigasi.identify_risk?.unit_kerja ??
                                                    'Tidak Diketahui'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Deskripsi Risiko</label>
                                        <p className="mt-1 text-sm text-gray-900">{mitigasi.identify_risk.description}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Data risiko tidak tersedia.</p>
                            )}
                        </div>

                        {mitigasi.bukti_implementasi && mitigasi.bukti_implementasi.length > 0 ? (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="mb-4 text-lg font-medium text-gray-900">Bukti Implementasi</h2>
                                <div className="space-y-3">
                                    {mitigasi.bukti_implementasi.map((file: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex items-center">
                                                <FileText className="mr-3 h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDownloadBukti(file.file_name || file.original_name)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveBukti(file.file_name || file.original_name)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Audit Trail</h2>
                            <div className="space-y-4">
                                {mitigasi.updated_at && mitigasi.updated_at !== mitigasi.created_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Terakhir diperbarui</label>
                                        <div className="mt-1 flex items-center">
                                            <User className="mr-2 h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">{mitigasi.updater?.name || 'Unknown'}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">{formatDateTime(mitigasi.updated_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Update Modal */}
                {showProgressModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 backdrop-blur-sm">
                        <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
                            <div className="mt-3">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Update Progress</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Progress (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progressData.progress_percentage}
                                            onChange={(e) =>
                                                setProgressData((prev) => ({
                                                    ...prev,
                                                    progress_percentage: parseInt(e.target.value),
                                                }))
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Catatan Progress</label>
                                        <textarea
                                            value={progressData.catatan_progress}
                                            onChange={(e) =>
                                                setProgressData((prev) => ({
                                                    ...prev,
                                                    catatan_progress: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Catatan mengenai progress terbaru"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-end space-x-3">
                                    <button
                                        onClick={() => setShowProgressModal(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleProgressUpdate}
                                        className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
