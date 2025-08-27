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
    XCircle,
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
                                className={`rounded border px-3 py-2 text-sm ${
                                    link.active ? 'border-[#12745a] bg-[#12745a] text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ) : (
                            <span
                                className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
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
            return <Clock className="h-4 w-4 text-gray-500" />;
        case 'sedang_berjalan':
            return <TrendingUp className="h-4 w-4 text-blue-500" />;
        case 'selesai':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'tertunda':
            return <Pause className="h-4 w-4 text-yellow-500" />;
        case 'dibatalkan':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-500" />;
    }
};

const getStatusBadge = (status: string, label: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

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
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

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
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

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
    const { mitigasis, filters, statusOptions, strategiOptions, auth }: any = usePage<any>().props;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');
    const isAdmin = roles.includes('admin');
    const isOwnerRisk = roles.includes('owner-risk');
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
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/mitigasi/${mitigasi.id}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Mitigasi berhasil dihapus.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error!', 'Gagal menghapus mitigasi.', 'error');
                    },
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
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/mitigasi/${mitigasi.id}/submit`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire('Berhasil!', 'Mitigasi berhasil dikirim untuk persetujuan.', 'success');
                        },
                        onError: () => {
                            Swal.fire('Error!', 'Gagal mengirim mitigasi.', 'error');
                        },
                    },
                );
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
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/mitigasi/${mitigasi.id}/approve`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire('Berhasil!', 'Mitigasi berhasil disetujui.', 'success');
                        },
                        onError: () => {
                            Swal.fire('Error!', 'Gagal menyetujui mitigasi.', 'error');
                        },
                    },
                );
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
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/mitigasi/${mitigasi.id}/reject`,
                    {
                        rejection_reason: result.value,
                    },
                    {
                        onSuccess: () => {
                            Swal.fire('Berhasil!', 'Mitigasi berhasil ditolak.', 'success');
                        },
                        onError: () => {
                            Swal.fire('Error!', 'Gagal menolak mitigasi.', 'error');
                        },
                    },
                );
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
            day: 'numeric',
        });
    };

    const isOverdue = (targetDate: string, status: string) => {
        return new Date(targetDate) < new Date() && !['selesai', 'dibatalkan'].includes(status);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Mitigasi" />

            <div className="space-y-6 px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mitigasi</h1>
                        <p className="mt-1 text-sm text-gray-600">Kelola rencana mitigasi risiko dan pantau progress implementasi</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="w-full mr-3 flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari mitigasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-[#12745a] focus:ring-[#12745a]"
                                />
                            </div>
                        </form>

                        {/* Filter Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </button>
                            {(filters.status || filters.strategi || filters.validation_status) && (
                                <button onClick={clearFilters} className="text-sm text-[#12745a] hover:text-[#0c4435]">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilter('status', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#12745a] focus:ring-[#12745a]"
                                    >
                                        <option value="">Semua Status</option>
                                        {Object.entries(statusOptions).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Strategi</label>
                                    <select
                                        value={filters.strategi || ''}
                                        onChange={(e) => handleFilter('strategi', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#12745a] focus:ring-[#12745a]"
                                    >
                                        <option value="">Semua Strategi</option>
                                        {Object.entries(strategiOptions).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Status Validasi</label>
                                    <select
                                        value={filters.validation_status || ''}
                                        onChange={(e) => handleFilter('validation_status', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#12745a] focus:ring-[#12745a]"
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
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    {mitigasis.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada mitigasi</h3>
                            <p className="mt-1 text-sm text-gray-500">Belum ada risiko yang disetujui / dikirim.</p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            {' '}
                            {/* CHANGE: Added overflow-x-auto back, but on the inner div */}
                            <table className="min-w-full table-fixed divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* CHANGE: Adjusted width percentages */}
                                        <th className="w-[25%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Mitigasi
                                        </th>
                                        <th className="w-[25%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Risiko
                                        </th>
                                        <th className="w-[8%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Strategi
                                        </th>
                                        <th className="w-[8%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">PIC</th>
                                        <th className="w-[10%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Target
                                        </th>
                                        <th className="w-[7%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Progress
                                        </th>
                                        <th className="w-[7%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="w-[8%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Validasi
                                        </th>
                                        <th className="w-[12%] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {mitigasis.data.map((mitigasi) => (
                                        <tr key={mitigasi.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-4 align-top">
                                                <div>
                                                    <div className="text-sm font-medium break-words text-gray-900">{mitigasi.judul_mitigasi}</div>
                                                    <div className="text-sm break-words text-gray-500">{mitigasi.deskripsi_mitigasi}</div>{' '}
                                                    {/* CHANGE: Changed truncate to break-words */}
                                                    {mitigasi.biaya_mitigasi && (
                                                        <div className="mt-1 text-xs font-medium text-green-600">
                                                            {formatCurrency(mitigasi.biaya_mitigasi)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="text-sm break-words text-gray-900">{mitigasi.identify_risk?.id_identify}</div>
                                                <div className="text-sm break-words text-gray-500">{mitigasi.identify_risk?.description}</div>{' '}
                                                {/* CHANGE: Changed truncate to break-words */}
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <span className={getStrategiBadge(mitigasi.strategi_mitigasi)}>
                                                    {mitigasi.strategi_label || strategiOptions?.[mitigasi.strategi_mitigasi]}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="flex items-center">
                                                    <User className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <span className="text-sm break-words text-gray-900">{mitigasi.pic_mitigasi}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <div>
                                                        <div
                                                            className={`text-sm ${isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi) ? 'font-medium text-red-600' : 'text-gray-900'}`}
                                                        >
                                                            {formatDate(mitigasi.target_selesai)}
                                                        </div>
                                                        {isOverdue(mitigasi.target_selesai, mitigasi.status_mitigasi) && (
                                                            <div className="text-xs text-red-500">Terlambat</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="w-full">
                                                    <div className="mb-1 text-xs text-gray-600">{mitigasi.progress_percentage}%</div>
                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2 rounded-full bg-[#12745a]"
                                                            style={{ width: `${mitigasi.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="flex items-center">
                                                    {getStatusIcon(mitigasi.status_mitigasi)}
                                                    <span
                                                        className={`ml-2 ${getStatusBadge(mitigasi.status_mitigasi, mitigasi.status_label || statusOptions?.[mitigasi.status_mitigasi])}`}
                                                    >
                                                        {mitigasi.status_label || statusOptions?.[mitigasi.status_mitigasi]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={getValidationStatusBadge(mitigasi.validation_status || 'draft')}>
                                                        {getValidationStatusLabel(mitigasi.validation_status || 'draft')}
                                                    </span>
                                                    {mitigasi.validation_status === 'rejected' && mitigasi.rejection_reason && (
                                                        <div className="text-xs break-words text-red-600" title={mitigasi.rejection_reason}>
                                                            {' '}
                                                            {/* CHANGE: Changed truncate to break-words */}
                                                            {mitigasi.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-top">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/mitigasi/${mitigasi.id}`}
                                                        className="text-[#12745a] hover:text-[#0c4435]"
                                                        title="Lihat Detail"
                                                        >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    {/* Admin: read-only */}
                                                    {!isAdmin && (
                                                        <>
                                                            {/* Owner Risk full actions */}
                                                            {isOwnerRisk && mitigasi.permissions?.canEdit && (
                                                                <Link
                                                                    href={`/mitigasi/${mitigasi.id}/edit`}
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            )}
                                                            {isOwnerRisk && mitigasi.permissions?.canSubmit && (
                                                                <button
                                                                    onClick={() => handleSubmit(mitigasi)}
                                                                    className="text-[#12745a] hover:text-[#0c4435]"
                                                                    title="Submit untuk Persetujuan"
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {isOwnerRisk && mitigasi.permissions?.canDelete && (
                                                                <button
                                                                    onClick={() => handleDelete(mitigasi)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {/* Super Admin: only approve/reject */}
                                                            {isSuperAdmin && mitigasi.validation_status && ['submitted','pending'].includes(mitigasi.validation_status) && (
                                                                <>
                                                                    {mitigasi.permissions?.canApprove && (
                                                                        <button
                                                                            onClick={() => handleApprove(mitigasi)}
                                                                            className="text-green-600 hover:text-green-900"
                                                                            title="Setujui"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                    {mitigasi.permissions?.canReject && (
                                                                        <button
                                                                            onClick={() => handleReject(mitigasi)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                            title="Tolak"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
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
