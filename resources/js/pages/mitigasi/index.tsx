import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { BreadcrumbItem, Mitigasi, PaginatedData } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
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
    Search,
    Send,
    TrendingUp,
    User,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface PageProps {
    mitigasis: PaginatedData<Mitigasi>;
    filters: {
        status_mitigasi?: string;
        validation_status?: string;
        strategi_mitigasi?: string;
        identify_risk_id?: string;
        search?: string;
    };
    statusOptions: Record<string, string>;
    validationStatusOptions: Record<string, string>;
    strategiOptions: Record<string, string>;
    auth: any;
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
                                className={`rounded border px-3 py-2 text-sm ${link.active
                                        ? 'border-[#006d77] bg-[#006d77] text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
            return <Clock className="h-4 w-4 shrink-0 text-gray-500" />;
        case 'sedang_berjalan':
            return <TrendingUp className="h-4 w-4 shrink-0 text-blue-500" />;
        case 'selesai':
            return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />;
        case 'tertunda':
            return <Pause className="h-4 w-4 shrink-0 text-yellow-500" />;
        case 'dibatalkan':
            return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
        default:
            return <Clock className="h-4 w-4 shrink-0 text-gray-500" />;
    }
};

const getStatusBadge = (status: string, label: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap';

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
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap';

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
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap';

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

export default function Index() {
    const { mitigasis, filters, statusOptions, strategiOptions, validationStatusOptions, auth }: PageProps = usePage<InertiaPageProps & PageProps>()
        .props;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');
    const isAdmin = roles.includes('admin');
    const isOwnerRisk = roles.includes('owner-risk');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredMitigasis = mitigasis.data.filter((mitigasi) => mitigasi.validation_status !== 'draft' || isOwnerRisk);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        router.get(
            '/mitigasi',
            { ...filters, search: searchTerm },
            {
                preserveState: true,
                onError: (errors) => {
                    Swal.fire('Error!', errors.message || 'Gagal melakukan pencarian.', 'error');
                    setIsLoading(false);
                },
                onSuccess: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        setIsLoading(true);
        const newFilters = { ...filters, [key]: value };
        if (!value) {
            delete newFilters[key];
        }
        router.get('/mitigasi', newFilters, {
            preserveState: true,
            onError: (errors) => {
                Swal.fire('Error!', errors.message || 'Gagal menerapkan filter.', 'error');
                setIsLoading(false);
            },
            onSuccess: () => {
                setIsLoading(false);
            },
        });
    };

    const clearFilters = () => {
        setIsLoading(true);
        router.get(
            '/mitigasi',
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    setSearchTerm('');
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            },
        );
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
            title: 'Revisi Mitigasi?',
            input: 'textarea',
            inputLabel: 'Alasan Perbaikkan',
            inputPlaceholder: 'Masukkan alasan perbaikkan...',
            inputValidator: (value) => {
                if (!value) {
                    return 'Alasan penolakan harus diisi!';
                }
            },
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Revisi!',
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
                            Swal.fire('Berhasil!', 'Mitigasi berhasil direvisi.', 'success');
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

    const columns: ColumnDef<Mitigasi>[] = [
        {
            accessorKey: 'judul_mitigasi',
            header: 'Mitigasi',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-gray-900">{item.judul_mitigasi}</div>
                        {item.biaya_mitigasi && (
                            <div className="text-xs font-semibold text-green-600">
                                {formatCurrency(item.biaya_mitigasi)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'risiko',
            header: 'Risiko',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="text-sm font-medium text-gray-900">
                        {item.identify_risk?.id_identify || '-'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'strategi_mitigasi',
            header: 'Strategi',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <span className={getStrategiBadge(item.strategi_mitigasi)}>
                        {item.strategi_label || strategiOptions?.[item.strategi_mitigasi] || 'Tidak Diketahui'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'pic_mitigasi',
            header: 'PIC',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <User className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.pic_mitigasi}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'target_selesai',
            header: 'Target',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                            <div className={`text-sm ${isOverdue(item.target_selesai, item.status_mitigasi) ? 'font-medium text-red-600' : 'text-gray-900'}`}>
                                {formatDate(item.target_selesai)}
                            </div>
                            {isOverdue(item.target_selesai, item.status_mitigasi) && (
                                <div className="text-xs font-semibold text-red-500">Terlambat</div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'progress_percentage',
            header: 'Progress',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="min-w-[80px]">
                        <div className="mb-1 text-xs font-semibold text-gray-600">{item.progress_percentage}%</div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-[#006d77]"
                                style={{ width: `${item.progress_percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status_mitigasi',
            header: 'Status',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {getStatusIcon(item.status_mitigasi)}
                        <span className={getStatusBadge(item.status_mitigasi, item.status_label || statusOptions?.[item.status_mitigasi] || 'Tidak Diketahui')}>
                            {item.status_label || statusOptions?.[item.status_mitigasi] || 'Tidak Diketahui'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'validation_status',
            header: 'Validasi',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <span className={getValidationStatusBadge(item.validation_status || 'draft')}>
                        {getValidationStatusLabel(item.validation_status || 'draft')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => {
                const mitigasi = row.original;
                return (
                    <div className="flex items-center justify-center space-x-1">
                        <Link
                            href={`/mitigasi/${mitigasi.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-300 text-green-900 hover:bg-green-500 hover:text-white"
                            title="Lihat Detail"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                        {!isAdmin && (
                            <>
                                {isOwnerRisk && mitigasi.permissions?.canEdit && (
                                    <Link
                                        href={`/mitigasi/${mitigasi.id}/edit`}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                                        title="Edit"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                )}
                                {isOwnerRisk && mitigasi.permissions?.canSubmit && (
                                    <button
                                        onClick={() => handleSubmit(mitigasi)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white"
                                        title="Submit untuk Persetujuan"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                )}
                                {isSuperAdmin &&
                                    mitigasi.validation_status &&
                                    ['submitted', 'pending'].includes(mitigasi.validation_status) && (
                                        <>
                                            {mitigasi.permissions?.canApprove && (
                                                <button
                                                    onClick={() => handleApprove(mitigasi)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 hover:bg-teal-500 hover:text-white"
                                                    title="Setujui"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                            )}
                                            {mitigasi.permissions?.canReject && (
                                                <button
                                                    onClick={() => handleReject(mitigasi)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-500 hover:text-white"
                                                    title="Revisi"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            )}
                                        </>
                                    )}
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

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
                        <form onSubmit={handleSearch} className="mr-3 w-full flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari judul atau deskripsi mitigasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-[#006d77] focus:ring-[#006d77]"
                                    disabled={isLoading}
                                />
                            </div>
                        </form>

                        {/* Filter Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                {isLoading ? 'Memuat...' : 'Filter'}
                            </button>
                            {(filters.status_mitigasi || filters.strategi_mitigasi || filters.validation_status || filters.search) && (
                                <button onClick={clearFilters} className="text-sm text-[#006d77] hover:text-[#0c4435]" disabled={isLoading}>
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
                                        value={filters.status_mitigasi || ''}
                                        onChange={(e) => handleFilter('status_mitigasi', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#006d77] focus:ring-[#006d77]"
                                        disabled={isLoading}
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
                                        value={filters.strategi_mitigasi || ''}
                                        onChange={(e) => handleFilter('strategi_mitigasi', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#006d77] focus:ring-[#006d77]"
                                        disabled={isLoading}
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
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#006d77] focus:ring-[#006d77]"
                                        disabled={isLoading}
                                    >
                                        <option value="">Semua Status Validasi</option>
                                        {Object.entries(validationStatusOptions).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mitigasi Table via Shadcn UI DataTable */}
                <DataTable columns={columns} data={filteredMitigasis} />

                {/* Pagination */}
                {mitigasis.links && <Pagination links={mitigasis.links} />}
            </div>
        </AppLayout>
    );
}
