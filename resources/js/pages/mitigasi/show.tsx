import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Mitigasi } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Download,
    Calendar,
    DollarSign,
    User,
    FileText,
    Target,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    XCircle,
    Pause,
    ExternalLink,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface PageProps {
    mitigasi: Mitigasi | null;
    statusOptions?: Record<string, string>; // Make optional with fallback
    strategiOptions?: Record<string, string>; // Make optional with fallback
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Mitigasi', href: '/mitigasi' },
    { title: 'Detail Mitigasi', href: '#' },
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'belum_dimulai': return <Clock className="w-5 h-5 text-gray-500" />;
        case 'sedang_berjalan': return <TrendingUp className="w-5 h-5 text-blue-500" />;
        case 'selesai': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case 'tertunda': return <Pause className="w-5 h-5 text-yellow-500" />;
        case 'dibatalkan': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
};

const getStatusBadge = (status: string, label: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
        case 'belum_dimulai': return `${baseClasses} bg-gray-100 text-gray-800`;
        case 'sedang_berjalan': return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'selesai': return `${baseClasses} bg-green-100 text-green-800`;
        case 'tertunda': return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'dibatalkan': return `${baseClasses} bg-red-100 text-red-800`;
        default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const getStrategiBadge = (strategi: string, label: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (strategi) {
        case 'avoid': return `${baseClasses} bg-red-100 text-red-800`;
        case 'reduce': return `${baseClasses} bg-orange-100 text-orange-800`;
        case 'transfer': return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'accept': return `${baseClasses} bg-green-100 text-green-800`;
        default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

export default function Show() {
    const { mitigasi, statusOptions = {}, strategiOptions = {} } = usePage<PageProps>().props;
    if (!mitigasi) {
        return <div className="text-center p-4 text-red-500">Data mitigasi tidak ditemukan.</div>;
    }

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressData, setProgressData] = useState({
        progress_percentage: mitigasi.progress_percentage || 0,
        catatan_progress: mitigasi.catatan_progress || ''
    });

    const handleDelete = () => {
        Swal.fire({
            title: 'Hapus Mitigasi?',
            text: `Apakah Anda yakin ingin menghapus mitigasi "${mitigasi.judul_mitigasi}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/mitigasi/${mitigasi.id}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Mitigasi berhasil dihapus.', 'success');
                        router.visit('/mitigasi');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus mitigasi.', 'error');
                    }
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
            }
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
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/mitigasi/${mitigasi.id}/bukti/${filename}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'File berhasil dihapus.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus file.', 'error');
                    }
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
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/mitigasi"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{mitigasi.judul_mitigasi || 'No Title'}</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                ID Risiko: {mitigasi.identify_risk?.id_identify || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <button
                            onClick={() => setShowProgressModal(true)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Update Progress
                        </button>
                        <Link
                            href={`/mitigasi/${mitigasi.id}/edit`}
                            className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            {getStatusIcon(mitigasi.status_mitigasi || 'belum_dimulai')}
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <span className={getStatusBadge(mitigasi.status_mitigasi || 'belum_dimulai', mitigasi.status_label || statusOptions[mitigasi.status_mitigasi] || 'Unknown')}>
                                    {mitigasi.status_label || statusOptions[mitigasi.status_mitigasi] || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Target className="w-5 h-5 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Progress</p>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${mitigasi.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {mitigasi.progress_percentage || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Target Selesai</p>
                                <p className={`text-sm font-medium ${
                                    mitigasi.target_selesai && isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi || 'belum_dimulai')
                                        ? 'text-red-600'
                                        : (mitigasi.target_selesai && daysUntilTarget <= 7 && daysUntilTarget > 0)
                                        ? 'text-yellow-600'
                                        : 'text-gray-900'
                                }`}>
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

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Biaya</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {mitigasi.biaya_mitigasi ? formatCurrency(mitigasi.biaya_mitigasi) : 'Tidak ditentukan'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Mitigasi</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Deskripsi Mitigasi</label>
                                    <p className="mt-1 text-sm text-gray-900">{mitigasi.deskripsi_mitigasi || 'N/A'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Strategi Mitigasi</label>
                                        <span className={`mt-1 ${getStrategiBadge(mitigasi.strategi_mitigasi || 'accept', mitigasi.strategi_label || strategiOptions[mitigasi.strategi_mitigasi] || 'Menerima')}`}>
                                            {mitigasi.strategi_label || strategiOptions[mitigasi.strategi_mitigasi] || 'Menerima'}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">PIC (Person In Charge)</label>
                                        <div className="mt-1 flex items-center">
                                            <User className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">{mitigasi.pic_mitigasi || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

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

                        {/* Risk Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Risiko Terkait</h2>

                            {mitigasi.identify_risk ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">ID Risiko</label>
                                            <p className="mt-1 text-sm text-gray-900">{mitigasi.identify_risk.id_identify}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Unit Kerja</label>
                                            <p className="mt-1 text-sm text-gray-900">{mitigasi.identify_risk.unit_kerja}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Deskripsi Risiko</label>
                                        <p className="mt-1 text-sm text-gray-900">{mitigasi.identify_risk.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Lihat detail risiko</span>
                                        <Link
                                            href={`/identifyrisk/${mitigasi.identify_risk.id}`}
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1" />
                                            Buka Detail
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Data risiko tidak tersedia.</p>
                            )}
                        </div>

                        {/* Files */}
                        {mitigasi.bukti_implementasi && mitigasi.bukti_implementasi.length > 0 ? (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Bukti Implementasi</h2>

                                <div className="space-y-3">
                                    {mitigasi.bukti_implementasi.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDownloadBukti(file.filename || file.original_name)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveBukti(file.filename || file.original_name)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                        {/* Audit Trail */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Trail</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Dibuat oleh</label>
                                    <div className="mt-1 flex items-center">
                                        <User className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900">
                                            {mitigasi.creator?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {mitigasi.created_at ? formatDateTime(mitigasi.created_at) : 'N/A'}
                                    </p>
                                </div>

                                {mitigasi.updated_at && mitigasi.updated_at !== mitigasi.created_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Terakhir diperbarui</label>
                                        <div className="mt-1 flex items-center">
                                            <User className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {mitigasi.updater?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDateTime(mitigasi.updated_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>

                            <div className="space-y-3">
                                <Link
                                    href={`/mitigasi/create?risk_id=${mitigasi.identify_risk_id || ''}`}
                                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Mitigasi Lain
                                </Link>

                                <Link
                                    href={`/identifyrisk/${mitigasi.identify_risk_id || ''}`}
                                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Lihat Detail Risiko
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Update Modal */}
                {showProgressModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Progress</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Progress (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progressData.progress_percentage}
                                            onChange={(e) => setProgressData(prev => ({
                                                ...prev,
                                                progress_percentage: parseInt(e.target.value) || 0
                                            }))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Catatan Progress
                                        </label>
                                        <textarea
                                            value={progressData.catatan_progress}
                                            onChange={(e) => setProgressData(prev => ({
                                                ...prev,
                                                catatan_progress: e.target.value
                                            }))}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Catatan mengenai progress terbaru"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowProgressModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleProgressUpdate}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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
