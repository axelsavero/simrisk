import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Mitigasi, PaginatedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    CheckCircle2,
    Clock,
    Edit,
    Eye,
    Filter,
    Pause,
    Plus,
    Search,
    Send,
    Trash2,
    TrendingUp,
    User,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface PageProps {
    mitigasis: PaginatedData<Mitigasi>;
    filters: {
        status?: string;
        validation_status?: string;
        strategi_mitigasi?: string;
        identify_risk_id?: string;
        search?: string;
    };
    statusOptions: Record<string, string>;
    validationStatusOptions: Record<string, string>;
    strategiOptions: Record<string, string>;
    identifyRisks: Array<{ id: number; id_identify: string; description: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Mitigasi', href: '/mitigasi' },
];

const Pagination = ({ links }: { links: Array<{ url: string | null; label: string; active: boolean }> }) => {
    if (!links || links.length <= 3) {
        return null;
    }
    return (
        <nav aria-label="Page navigation" className="mt-6">
            <ul className="flex justify-center space-x-1">
                {links.map((link, index) => (
                    <li key={index}>
                        {link.url ? (
                            <Link
                                className={`px-3 py-2 text-sm border rounded ${
                                    link.active
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ) : (
                            <span
                                className="px-3 py-2 text-sm text-gray-400 border border-gray-300 rounded bg-gray-50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'belum_dimulai':
            return <Clock className="w-4 h-4 text-gray-500" />;
        case 'sedang_berjalan':
            return <TrendingUp className="w-4 h-4 text-blue-500" />;
        case 'selesai':
            return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'tertunda':
            return <Pause className="w-4 h-4 text-yellow-500" />;
        case 'dibatalkan':
            return <XCircle className="w-4 h-4 text-red-500" />;
        default:
            return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

const getStatusBadge = (status: string, label: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
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

const getStrategiBadge = (strategi: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
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
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
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
            return 'Ditolak';
        default:
            return 'Tidak Diketahui';
    }
};

export default function Index() {
    const { mitigasis, filters, statusOptions, strategiOptions } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/mitigasi', { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) {
            delete newFilters[key];
        }
        router.get('/mitigasi', newFilters, { preserveState: true });
    };

    const clearFilters = () => {
        router.get('/mitigasi', {}, { preserveState: true });
        setSearchTerm('');
    };

    const handleDelete = (mitigasi: Mitigasi) => {
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
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus mitigasi.', 'error');
                    }
                });
            }
        });
    };

    const handleSubmit = (mitigasi: Mitigasi) => {
        Swal.fire({
            title: 'Submit Mitigasi?',
            text: `Apakah Anda yakin ingin mengirim mitigasi "${mitigasi.judul_mitigasi}" untuk persetujuan?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Submit!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/mitigasi/${mitigasi.id}/submit`, {}, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Mitigasi berhasil dikirim untuk persetujuan.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal mengirim mitigasi.', 'error');
                    }
                });
            }
        });
    };

    const handleApprove = (mitigasi: Mitigasi) => {
        Swal.fire({
            title: 'Setujui Mitigasi?',
            text: `Apakah Anda yakin ingin menyetujui mitigasi "${mitigasi.judul_mitigasi}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Setujui!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/mitigasi/${mitigasi.id}/approve`, {}, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Mitigasi berhasil disetujui.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menyetujui mitigasi.', 'error');
                    }
                });
            }
        });
    };

    const handleReject = (mitigasi: Mitigasi) => {
        Swal.fire({
            title: 'Tolak Mitigasi?',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Masukkan alasan penolakan...',
            inputValidator: (value) => {
                if (!value) {
                    return 'Alasan penolakan harus diisi!';
                }
            },
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Tolak!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/mitigasi/${mitigasi.id}/reject`, {
                    rejection_reason: result.value
                }, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Mitigasi berhasil ditolak.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menolak mitigasi.', 'error');
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
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (targetDate: string, status: string) => {
        return new Date(targetDate) < new Date() && 
               !['selesai', 'dibatalkan'].includes(status);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Mitigasi" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mitigasi</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Kelola rencana mitigasi risiko dan pantau progress implementasi
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href="/mitigasi/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Mitigasi
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari mitigasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </form>

                        {/* Filter Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                            {(filters.status || filters.strategi || filters.validation_status) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilter('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Semua Status</option>
                                        {Object.entries(statusOptions).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Strategi
                                    </label>
                                    <select
                                        value={filters.strategi || ''}
                                        onChange={(e) => handleFilter('strategi', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Semua Strategi</option>
                                        {Object.entries(strategiOptions).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status Validasi
                                    </label>
                                    <select
                                        value={filters.validation_status || ''}
                                        onChange={(e) => handleFilter('validation_status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Semua Status Validasi</option>
                                        <option value="draft">Draft</option>
                                        <option value="submitted">Menunggu Persetujuan</option>
                                        <option value="pending">Menunggu Persetujuan</option>
                                        <option value="approved">Disetujui</option>
                                        <option value="rejected">Ditolak</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mitigasi List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {mitigasis.data.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada mitigasi</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Belum ada mitigasi yang dibuat. Mulai dengan menambahkan mitigasi baru.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/mitigasi/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Mitigasi
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mitigasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Risiko
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Strategi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PIC
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Target
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Validasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mitigasis.data.map((mitigasi) => (
                                        <tr key={mitigasi.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mitigasi.judul_mitigasi}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {mitigasi.deskripsi_mitigasi}
                                                    </div>
                                                    {mitigasi.biaya_mitigasi && (
                                                        <div className="text-xs text-green-600 font-medium mt-1">
                                                            {formatCurrency(mitigasi.biaya_mitigasi)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {mitigasi.identify_risk?.id_identify}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {mitigasi.identify_risk?.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getStrategiBadge(mitigasi.strategi_mitigasi)}>
                                                    {mitigasi.strategi_label || strategiOptions[mitigasi.strategi_mitigasi]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">
                                                        {mitigasi.pic_mitigasi}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <div className={`text-sm ${
                                                            isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi)
                                                                ? 'text-red-600 font-medium'
                                                                : 'text-gray-900'
                                                        }`}>
                                                            {formatDate(mitigasi.target_selesai)}
                                                        </div>
                                                        {isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi) && (
                                                            <div className="text-xs text-red-500">
                                                                Terlambat
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-gray-600">
                                                                {mitigasi.progress_percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${mitigasi.progress_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {getStatusIcon(mitigasi.status_mitigasi)}
                                                    <span className={`ml-2 ${getStatusBadge(mitigasi.status_mitigasi, mitigasi.status_label || statusOptions[mitigasi.status_mitigasi])}`}>
                                                        {mitigasi.status_label || statusOptions[mitigasi.status_mitigasi]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={getValidationStatusBadge(mitigasi.validation_status || 'draft')}>
                                                        {getValidationStatusLabel(mitigasi.validation_status || 'draft')}
                                                    </span>
                                                    {mitigasi.validation_status === 'rejected' && mitigasi.rejection_reason && (
                                                        <div className="text-xs text-red-600 max-w-xs truncate" title={mitigasi.rejection_reason}>
                                                            {mitigasi.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/mitigasi/${mitigasi.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    
                                                    {/* Edit button - only if can edit */}
                                                    {mitigasi.permissions?.canEdit && (
                                                        <Link
                                                            href={`/mitigasi/${mitigasi.id}/edit`}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                    
                                                    {/* Submit button - only if can submit */}
                                                    {mitigasi.permissions?.canSubmit && (
                                                        <button
                                                            onClick={() => handleSubmit(mitigasi)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Submit untuk Persetujuan"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Approve button - only if can approve */}
                                                    {mitigasi.permissions?.canApprove && (
                                                        <button
                                                            onClick={() => handleApprove(mitigasi)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Reject button - only if can reject */}
                                                    {mitigasi.permissions?.canReject && (
                                                        <button
                                                            onClick={() => handleReject(mitigasi)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Tolak"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Delete button - only if can delete */}
                                                    {mitigasi.permissions?.canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(mitigasi)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {mitigasis.links && <Pagination links={mitigasis.links} />}
            </div>
        </AppLayout>
    );
}