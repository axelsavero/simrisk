// resources/js/pages/identifyrisk/index.tsx
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    ChartColumnIncreasing,
    CheckCircle2,
    CircleCheck,
    CircleHelp,
    CirclePlus,
    Cog,
    Eye,
    Hourglass,
    Pencil,
    Search,
    ShieldAlert,
    SquarePen,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Validasi Input Risiko', href: route('identify-risk.index') },
];

type PageProps = {
    identifyRisks: { data: IdentifyRisk[]; links?: Array<{ url: string | null; label: string; active: boolean }> };
    flash?: any;
    auth?: any;
    permissions?: {
        canCreate?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canSubmit?: boolean;
        canValidate?: boolean;
        canApprove?: boolean;
        canReject?: boolean;
    };
    totalStats?: {
        total: number;
        draft: number;
        pending: number;
        approved: number;
        rejected: number;
    };
};

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

export default function Index() {
    const { identifyRisks, flash, auth, permissions, totalStats } = usePage<PageProps>().props;
    const roles: string[] = auth?.user?.roles || [];
    const isSuperAdmin = roles.includes('super-admin');
    const isAdmin = roles.includes('admin');
    const isOwnerRisk = roles.includes('owner-risk');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (identifyRisks) setIsLoading(false);
    }, [identifyRisks]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!identifyRisks) {
        return (
            <div className="flex flex-col items-center justify-center bg-white p-8 text-gray-500">
                <ChartColumnIncreasing size={28} className="empty-icon" />
                <h3 className="mt-2 text-lg">Data Tidak Tersedia</h3>
                <p>Data identifikasi risiko tidak tersedia saat ini.</p>
            </div>
        );
    }

    const deleteItem = (item: IdentifyRisk) =>
        Swal.fire({
            title: 'Hapus Risiko?',
            text: `Yakin ingin menghapus identifikasi risiko "${item.id_identify}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => result.isConfirmed && router.delete(route('identify-risk.destroy', item.id), { preserveScroll: true }));

    const approveItem = (item: IdentifyRisk) =>
        Swal.fire({
            title: 'Setujui Risiko?',
            text: `Yakin ingin menyetujui risiko "${item.id_identify}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Setujui',
            cancelButtonText: 'Batal',
        }).then((result) => result.isConfirmed && router.post(route('identify-risk.approve', item.id), {}, { preserveScroll: true }));

    const submitItem = (item: IdentifyRisk) =>
        Swal.fire({
            title: 'Kirim Risiko?',
            text: `Yakin ingin mengirim risiko "${item.id_identify}" untuk validasi?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Kirim',
            cancelButtonText: 'Batal',
        }).then((result) => result.isConfirmed && router.post(route('identify-risk.submit', item.id), {}, { preserveScroll: true }));

    const rejectItem = (item: IdentifyRisk) =>
        Swal.fire({
            title: 'Revisi Risiko',
            html: `
                <div class="text-left max-w-xs">
                    <div class="mb-2"><strong>Kode Risiko</strong>: ${item.id_identify}</div>
                    <div class="mb-2"><strong>Deskripsi Risiko</strong>: ${item.description}</div>
                    <div class="mb-2"><strong>Penyebab Risiko</strong>: ${item.penyebab && Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => p.description).join(', ') : ''
                }</div>
                    <div class="mb-2"><strong>Alasan</strong>:</div>
                    <textarea id="swal-reject-reason" class="swal2-textarea w-full min-w-0 max-w-[95%] min-h-[100px] resize-y" placeholder="Tuliskan alasan revisi..."></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Revisi',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const reason = (document.getElementById('swal-reject-reason') as HTMLTextAreaElement)?.value;
                if (!reason?.trim()) Swal.showValidationMessage('Alasan revisi harus diisi');
                return reason;
            },
        }).then(
            (result) =>
                result.isConfirmed &&
                result.value &&
                router.post(route('identify-risk.reject', item.id), { rejection_reason: result.value }, { preserveScroll: true }),
        );

    const canShowEdit = (item: IdentifyRisk) =>
        auth?.user?.roles?.includes('super-admin')
            ? item.validation_status === 'draft' || item.validation_status === 'rejected'
            : item.validation_status === 'draft' || item.validation_status === 'rejected';
    const canShowSubmit = (item: IdentifyRisk) => item.validation_status === 'draft' || item.validation_status === 'rejected';
    
    const getRiskLevelInfo = (probability: number, impact: number) => {
        const risk = probability * impact;
        return risk >= 20
            ? { level: 'Tinggi', color: 'high' }
            : risk >= 9
                ? { level: 'Sedang', color: 'medium' }
                : risk >= 3
                    ? { level: 'Rendah', color: 'low' }
                    : { level: 'Sangat Rendah', color: 'very-low' };
    };

    const getValidationStatusInfo = (status: string) =>
        ({
            draft: { label: 'Draft', color: 'draft', icon: <SquarePen className="h-4 w-4 inline mr-1" /> },
            submitted: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass className="h-4 w-4 inline mr-1" /> },
            pending: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass className="h-4 w-4 inline mr-1" /> },
            approved: { label: 'Disetujui', color: 'success', icon: <CheckCircle2 className="h-4 w-4 inline mr-1" /> },
            rejected: { label: 'Butuh Perbaikan', color: 'danger', icon: <Cog className="h-4 w-4 inline mr-1" /> },
            default: { label: 'Unknown', color: 'secondary', icon: <CircleHelp className="h-4 w-4 inline mr-1" /> },
        })[status] || { label: 'Unknown', color: 'secondary', icon: <CircleHelp className="h-4 w-4 inline mr-1" /> };

    const filteredRisks = identifyRisks.data.filter((item: IdentifyRisk) => {
        if ((isSuperAdmin || isAdmin) && item.validation_status === 'draft') {
            return false;
        }
        const matchesSearch = [item.id_identify, item.risk_category, item.description, (item as any).unit_kerja || ''].some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && (item.validation_status === 'pending' || item.validation_status === 'submitted')) ||
            (filterStatus !== 'pending' && item.validation_status === filterStatus);
        return matchesSearch && matchesFilter;
    });

    const showValidationActions = permissions?.canValidate;

    const columns: ColumnDef<IdentifyRisk>[] = [
        {
            id: 'no',
            header: () => <div className="text-center font-semibold">No</div>,
            cell: ({ row }) => <div className="text-center text-gray-500 font-medium w-8">{(row.original as any).no || row.index + 1}</div>,
        },
        {
            accessorKey: 'id_identify',
            header: 'Kode Risiko',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 whitespace-nowrap min-w-[110px]">
                        <span>{item.id_identify}</span>
                        {item.validation_status === 'draft' && (
                            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" title="Draft"></span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'unit_kerja',
            header: 'Unit Kerja',
            cell: ({ row }) => (
                <div className="min-w-[140px] max-w-[200px] whitespace-normal break-words font-medium text-gray-800">
                    {(row.original as any).unit_kerja || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Deskripsi Risiko',
            cell: ({ row }) => {
                const desc = row.original.description || '';
                return (
                    <div className="min-w-[200px] max-w-[340px] whitespace-normal break-words text-gray-700" title={desc}>
                        {desc}
                    </div>
                );
            },
        },
        {
            id: 'penyebab',
            header: 'Penyebab',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="min-w-[200px] max-w-[300px] whitespace-normal break-words text-gray-600">
                        {item.penyebab && Array.isArray(item.penyebab) && item.penyebab.length > 0
                            ? item.penyebab.map((p: any) => p.description).join(', ')
                            : '-'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'probability',
            header: () => <div className="text-center whitespace-nowrap">Prob</div>,
            cell: ({ row }) => <div className="text-center font-medium text-gray-700 whitespace-nowrap min-w-[60px]">{row.original.probability}/5</div>,
        },
        {
            accessorKey: 'impact',
            header: () => <div className="text-center whitespace-nowrap">Dampak</div>,
            cell: ({ row }) => <div className="text-center font-medium text-gray-700 whitespace-nowrap min-w-[60px]">{row.original.impact}/5</div>,
        },
        {
            id: 'level',
            header: 'Tingkat Risiko',
            cell: ({ row }) => {
                const item = row.original;
                const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                const colorMap: Record<string, string> = {
                    high: 'bg-red-50 text-red-700 border-red-200',
                    medium: 'bg-amber-50 text-amber-700 border-amber-200',
                    low: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    'very-low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };
                return (
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap border ${colorMap[riskInfo.color] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {riskInfo.level} ({item.probability * item.impact}/25)
                    </span>
                );
            },
        },
        {
            accessorKey: 'validation_status',
            header: 'Status',
            cell: ({ row }) => {
                const item = row.original;
                const validationInfo = getValidationStatusInfo(item.validation_status);
                const colorMap: Record<string, string> = {
                    draft: 'bg-amber-50 text-amber-700 border-amber-200',
                    warning: 'bg-amber-50 text-amber-700 border-amber-200',
                    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    danger: 'bg-rose-50 text-rose-700 border-rose-200',
                    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
                };
                return (
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap border ${colorMap[validationInfo.color] || ''}`}>
                        {validationInfo.icon} {validationInfo.label}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-center whitespace-nowrap">Aksi</div>,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap min-w-[120px]">
                        <Link
                            href={route('identify-risk.show', item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                            title="Detail"
                        >
                            <Eye size={18} />
                        </Link>
                        {!isAdmin && (
                            <>
                                {isOwnerRisk && permissions?.canSubmit && canShowSubmit(item) && (
                                    <button
                                        onClick={() => submitItem(item)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition"
                                        title="Kirim"
                                    >
                                        <Upload size={18} />
                                    </button>
                                )}
                                {isOwnerRisk && permissions?.canEdit && canShowEdit(item) && (
                                    <Link
                                        href={route('identify-risk.edit', item.id)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition"
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </Link>
                                )}
                                {isOwnerRisk && permissions?.canDelete && item.validation_status === 'draft' && (
                                    <button
                                        onClick={() => deleteItem(item)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                                        title="Hapus"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                {isSuperAdmin &&
                                    showValidationActions &&
                                    (item.validation_status === 'submitted' || item.validation_status === 'pending') && (
                                        <>
                                            {permissions?.canApprove && (
                                                <button
                                                    onClick={() => approveItem(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition"
                                                    title="Setujui"
                                                >
                                                    <CircleCheck size={18} />
                                                </button>
                                            )}
                                            {permissions?.canReject && (
                                                <button
                                                    onClick={() => rejectItem(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                                                    title="Revisi"
                                                >
                                                    <X size={18} />
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
        <div className="risk-index-container min-h-screen w-full bg-white px-3 md:px-6 py-4">
            {/* Header Section */}
            <div className="page-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="header-info">
                    <h1 className="page-title flex items-center gap-2.5 text-xl md:text-2xl font-bold text-gray-900">
                        <ShieldAlert size={36} className="title-icon text-[#006d77] shrink-0" />
                        Manajemen Risiko
                    </h1>
                    <p className="page-subtitle text-xs md:text-sm text-gray-600">Kelola dan pantau identifikasi risiko organisasi Anda</p>
                </div>
                {permissions?.canCreate && isOwnerRisk && (
                    <Link
                        href={route('identify-risk.create')}
                        className="btn btn-primary flex items-center justify-center gap-2 rounded-lg bg-[#006d77] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0c4435] transition shadow-sm shrink-0"
                    >
                        <CirclePlus size={20} className="btn-icon" />
                        <span>Tambah Risiko Baru</span>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="stat-card flex items-center rounded-xl bg-white p-3.5 md:p-4 border border-gray-100 shadow-sm">
                    <ChartColumnIncreasing size={36} className="stat-icon text-blue-600 shrink-0" />
                    <div className="stat-content ml-3 min-w-0">
                        <span className="stat-number block text-xl md:text-2xl font-bold text-gray-900">{totalStats?.total ?? identifyRisks.data.length}</span>
                        <span className="stat-label block text-xs md:text-sm text-gray-500 truncate">Total Risiko</span>
                    </div>
                </div>
                {!auth?.user?.roles?.includes('super-admin') && (
                    <>
                        <div className="stat-card flex items-center rounded-xl bg-white p-3.5 md:p-4 border border-gray-100 shadow-sm">
                            <SquarePen size={36} className="stat-icon text-amber-500 shrink-0" />
                            <div className="stat-content ml-3 min-w-0">
                                <span className="stat-number block text-xl md:text-2xl font-bold text-gray-900">
                                    {totalStats?.draft ?? identifyRisks.data.filter((item) => item.validation_status === 'draft').length}
                                </span>
                                <span className="stat-label block text-xs md:text-sm text-gray-500 truncate">Draft</span>
                            </div>
                        </div>
                        <div className="stat-card flex items-center rounded-xl bg-white p-3.5 md:p-4 border border-gray-100 shadow-sm">
                            <Hourglass size={36} className="stat-icon text-amber-500 shrink-0" />
                            <div className="stat-content ml-3 min-w-0">
                                <span className="stat-number block text-xl md:text-2xl font-bold text-gray-900">
                                    {
                                        totalStats?.pending ?? identifyRisks.data.filter(
                                            (item) => item.validation_status === 'pending' || item.validation_status === 'submitted',
                                        ).length
                                    }
                                </span>
                                <span className="stat-label block text-xs md:text-sm text-gray-500 truncate">Pending</span>
                            </div>
                        </div>
                    </>
                )}

                <div className="stat-card flex items-center rounded-xl bg-white p-3.5 md:p-4 border border-gray-100 shadow-sm">
                    <CircleCheck size={36} className="stat-icon text-emerald-600 shrink-0" />
                    <div className="stat-content ml-3 min-w-0">
                        <span className="stat-number block text-xl md:text-2xl font-bold text-gray-900">
                            {totalStats?.approved ?? identifyRisks.data.filter((item) => item.validation_status === 'approved').length}
                        </span>
                        <span className="stat-label block text-xs md:text-sm text-gray-500 truncate">Disetujui</span>
                    </div>
                </div>
                <div className="stat-card flex items-center rounded-xl bg-white p-3.5 md:p-4 border border-gray-100 shadow-sm">
                    <Cog size={36} className="stat-icon text-rose-600 shrink-0" />
                    <div className="stat-content ml-3 min-w-0">
                        <span className="stat-number block text-xl md:text-2xl font-bold text-gray-900">
                            {totalStats?.rejected ?? identifyRisks.data.filter((item) => item.validation_status === 'rejected').length}
                        </span>
                        <span className="stat-label block text-xs md:text-sm text-gray-500 truncate">Butuh Perbaikan</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="controls-section mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="search-box relative flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID, unit kerja, kategori, atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm focus:border-[#006d77] focus:ring-2 focus:ring-[#006d77]/20 focus:outline-none shadow-sm"
                    />
                    <Search size={18} className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
                </div>
                <div className="filter-tabs flex gap-2 overflow-x-auto pb-1 max-w-full shrink-0">
                    {['all', 'draft', 'pending', 'approved', 'rejected']
                        .filter((status) => {
                            if (auth?.user?.roles?.includes('super-admin')) {
                                return !['draft', 'pending'].includes(status);
                            }
                            return true;
                        })
                        .map((status) => (
                            <button
                                key={status}
                                className={`filter-tab rounded-lg px-3.5 py-2 text-xs md:text-sm font-medium whitespace-nowrap transition ${
                                    filterStatus === status
                                        ? 'bg-[#006d77] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status === 'all' ? 'Semua' : status === 'pending' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DataTable columns={columns} data={filteredRisks} />
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-4 md:hidden">
                {filteredRisks.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                        Tidak ada data risiko yang ditemukan.
                    </div>
                ) : (
                    filteredRisks.map((item, idx) => {
                        const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                        const validationInfo = getValidationStatusInfo(item.validation_status);
                        const riskColorMap: Record<string, string> = {
                            high: 'bg-red-50 text-red-700 border-red-200',
                            medium: 'bg-amber-50 text-amber-700 border-amber-200',
                            low: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                            'very-low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        };
                        const statusColorMap: Record<string, string> = {
                            draft: 'bg-amber-50 text-amber-700 border-amber-200',
                            warning: 'bg-amber-50 text-amber-700 border-amber-200',
                            success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            danger: 'bg-rose-50 text-rose-700 border-rose-200',
                            secondary: 'bg-gray-50 text-gray-700 border-gray-200',
                        };

                        return (
                            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                                            <span className="font-bold text-gray-900 text-base">{item.id_identify}</span>
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 mt-0.5">
                                            {(item as any).unit_kerja || '-'}
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${statusColorMap[validationInfo.color] || ''}`}>
                                        {validationInfo.icon} {validationInfo.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="space-y-2 text-xs text-gray-700">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Deskripsi</span>
                                        <p className="text-gray-800 leading-relaxed text-sm">{item.description || '-'}</p>
                                    </div>

                                    {item.penyebab && Array.isArray(item.penyebab) && item.penyebab.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Penyebab</span>
                                            <p className="text-gray-600 leading-relaxed">
                                                {item.penyebab.map((p: any) => p.description).join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-1 flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div><span className="text-gray-400">P:</span> <span className="font-semibold text-gray-800">{item.probability}</span></div>
                                            <span className="text-gray-300">×</span>
                                            <div><span className="text-gray-400">D:</span> <span className="font-semibold text-gray-800">{item.impact}</span></div>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${riskColorMap[riskInfo.color] || ''}`}>
                                            {riskInfo.level} ({item.probability * item.impact}/25)
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-1.5 border-t border-gray-100 pt-3">
                                    <Link
                                        href={route('identify-risk.show', item.id)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                                    >
                                        <Eye size={15} />
                                        <span>Detail</span>
                                    </Link>
                                    {!isAdmin && (
                                        <>
                                            {isOwnerRisk && permissions?.canSubmit && canShowSubmit(item) && (
                                                <button
                                                    onClick={() => submitItem(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-600 hover:text-white transition"
                                                >
                                                    <Upload size={15} />
                                                    <span>Kirim</span>
                                                </button>
                                            )}
                                            {isOwnerRisk && permissions?.canEdit && canShowEdit(item) && (
                                                <Link
                                                    href={route('identify-risk.edit', item.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-600 hover:text-white transition"
                                                >
                                                    <Pencil size={15} />
                                                    <span>Edit</span>
                                                </Link>
                                            )}
                                            {isOwnerRisk && permissions?.canDelete && item.validation_status === 'draft' && (
                                                <button
                                                    onClick={() => deleteItem(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-600 hover:text-white transition"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Hapus</span>
                                                </button>
                                            )}
                                            {isSuperAdmin &&
                                                showValidationActions &&
                                                (item.validation_status === 'submitted' || item.validation_status === 'pending') && (
                                                    <>
                                                        {permissions?.canApprove && (
                                                            <button
                                                                onClick={() => approveItem(item)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-600 hover:text-white transition"
                                                            >
                                                                <CircleCheck size={15} />
                                                                <span>Setujui</span>
                                                            </button>
                                                        )}
                                                        {permissions?.canReject && (
                                                            <button
                                                                onClick={() => rejectItem(item)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-600 hover:text-white transition"
                                                            >
                                                                <X size={15} />
                                                                <span>Revisi</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {identifyRisks.links && <Pagination links={identifyRisks.links} />}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs} children={page} />;
