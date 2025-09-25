// resources/js/pages/identifyrisk/index.tsx
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
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
};

// Kode Baru (sebagai pengganti)
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
                                    link.active
                                        ? 'border-[#12745a] bg-[#12745a] text-white'
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
    const { identifyRisks, flash, auth, permissions } = usePage<PageProps>().props;
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
                    <div class="mb-2"><strong>Penyebab Risiko</strong>: ${
                        item.penyebab && Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => p.description).join(', ') : ''
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
            draft: { label: 'Draft', color: 'draft', icon: <SquarePen /> },
            submitted: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass /> },
            pending: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass /> },
            approved: { label: 'Disetujui', color: 'success', icon: <CheckCircle2 /> },
            rejected: { label: 'Butuh Perbaikan', color: 'danger', icon: <Cog /> },
            default: { label: 'Unknown', color: 'secondary', icon: <CircleHelp /> },
        })[status] || { label: 'Unknown', color: 'secondary', icon: <CircleHelp /> };

    const filteredRisks = identifyRisks.data.filter((item: IdentifyRisk) => {
        // Role-based visibility: super-admin & admin cannot see drafts
        if ((isSuperAdmin || isAdmin) && item.validation_status === 'draft') {
            return false;
        }
        const matchesSearch = [item.id_identify, item.risk_category, item.description].some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && (item.validation_status === 'pending' || item.validation_status === 'submitted')) ||
            (filterStatus !== 'pending' && item.validation_status === filterStatus);
        return matchesSearch && matchesFilter;
    });

    // Reintroduce showValidationActions
    const showValidationActions = permissions?.canValidate;

    return (
        <div className="risk-index-container min-h-screen w-full bg-white px-2 md:px-6">
            {/* Header Section */}
            <div className="page-header mb-6 flex items-center justify-between">
                <div className="header-info mt-2.5">
                    <h1 className="page-title flex items-center gap-2 text-2xl font-bold">
                        <ShieldAlert size={40} className="title-icon" />
                        Manajemen Risiko
                    </h1>
                    <p className="page-subtitle text-gray-600">Kelola dan pantau identifikasi risiko organisasi Anda</p>
                </div>
                {permissions?.canCreate && isOwnerRisk && (
                    <Link
                        href={route('identify-risk.create')}
                        className="btn btn-primary flex items-center gap-2 rounded bg-[#12745a] px-4 py-2 text-white hover:bg-[#0c4435]"
                    >
                        <CirclePlus size={28} className="btn-icon" />
                        Tambah Risiko Baru
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="stat-card flex items-center rounded-lg bg-white p-4 shadow">
                    <ChartColumnIncreasing size={40} className="stat-icon text-blue-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">{identifyRisks.data.length}</span>
                        <span className="stat-label block text-gray-600">Total Risiko</span>
                    </div>
                </div>
                {!auth?.user?.roles?.includes('super-admin') && (
                    <>
                        <div className="stat-card flex items-center rounded-lg bg-white p-4 shadow">
                            <SquarePen size={40} className="stat-icon" />
                            <div className="stat-content ml-4">
                                <span className="stat-number text-2xl font-bold">
                                    {identifyRisks.data.filter((item) => item.validation_status === 'draft').length}
                                </span>
                                <span className="stat-label block text-gray-600">Draft</span>
                            </div>
                        </div>
                        <div className="stat-card flex items-center rounded-lg bg-white p-4 shadow">
                            <Hourglass size={40} className="stat-icon text-yellow-500" />
                            <div className="stat-content ml-4">
                                <span className="stat-number text-2xl font-bold">
                                    {
                                        identifyRisks.data.filter(
                                            (item) => item.validation_status === 'pending' || item.validation_status === 'submitted',
                                        ).length
                                    }
                                </span>
                                <span className="stat-label block text-gray-600">Pending</span>
                            </div>
                        </div>
                    </>
                )}

                <div className="stat-card flex items-center rounded-lg bg-white p-4 shadow">
                    <CircleCheck size={40} className="stat-icon text-green-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">
                            {identifyRisks.data.filter((item) => item.validation_status === 'approved').length}
                        </span>
                        <span className="stat-label block text-gray-600">Disetujui</span>
                    </div>
                </div>
                <div className="stat-card flex items-center rounded-lg bg-white p-4 shadow">
                    <Cog size={40} className="stat-icon text-red-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">
                            {identifyRisks.data.filter((item) => item.validation_status === 'rejected').length}
                        </span>
                        <span className="stat-label block text-gray-600">Butuh Perbaikan</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="controls-section mb-6 flex flex-col gap-4 md:flex-row">
                <div className="search-box relative flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID, kategori, atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input w-full rounded-lg border p-2 focus:ring-2 focus:ring-[#12745a] focus:outline-none"
                    />
                    <Search size={20} className="absolute top-2 right-3 text-gray-400" />
                </div>
                <div className="filter-tabs flex gap-2">
                    {['all', 'draft', 'pending', 'approved', 'rejected']
                        .filter((status) => {
                            // Jika super-admin, hilangkan draft dan pending
                            if (auth?.user?.roles?.includes('super-admin')) {
                                return !['draft', 'pending'].includes(status);
                            }
                            return true;
                        })
                        .map((status) => (
                            <button
                                key={status}
                                className={`filter-tab rounded-lg px-4 py-2 ${filterStatus === status ? 'bg-[#12745a] text-white' : 'bg-gray-200 text-gray-700'} transition hover:bg-[#0c4435] hover:text-white`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                </div>
            </div>

            {/* Risk Table */}
            <div className="risk-table-container w-full">
                <table className="risk-table w-full border border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left">No</th>
                            <th className="border border-black p-2 text-left">Kode Risiko</th>
                            <th className="border border-black p-2 text-left">Deskripsi</th>
                            <th className="border border-black p-2 text-left">Penyebab</th>
                            <th className="border border-black p-2 text-left">Probabilitas</th>
                            <th className="border border-black p-2 text-left">Dampak</th>
                            <th className="border border-black p-2 text-left">Tingkat Risiko</th>
                            <th className="border border-black p-2 text-left">Status</th>
                            <th className="border border-black p-2 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRisks.length > 0 ? (
                            filteredRisks
                                .slice() // Create a shallow copy to avoid mutating the original array
                                .sort((a, b) => a.id - b.id) // Sort risks by ID in ascending order
                                .map((item, index) => {
                                    const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                                    const validationInfo = getValidationStatusInfo(item.validation_status);
                                    return (
                                        <tr key={item.id} className={`risk-row ${item.validation_status === 'draft' ? 'bg-yellow-50' : ''}`}>
                                            <td className="border border-black p-2">{item.no}</td>
                                            <td className="border border-black p-2">
                                                <div className="flex items-center gap-2">
                                                    {item.id_identify}
                                                    {item.validation_status === 'draft' && (
                                                        <span className="draft-badge h-2 w-2 rounded-full bg-yellow-400"></span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-black p-2">
                                                {item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
                                            </td>
                                            <td className="border border-black p-2">
                                                {item.penyebab && Array.isArray(item.penyebab)
                                                    ? item.penyebab.map((p: any) => p.description).join(', ')
                                                    : '-'}
                                            </td>
                                            <td className="border border-black p-2">{item.probability}/5</td>
                                            <td className="border border-black p-2">{item.impact}/5</td>
                                            <td
                                                className={`border border-black p-2 ${
                                                    {
                                                        high: 'bg-red-100 text-red-800',
                                                        medium: 'bg-yellow-100 text-yellow-800',
                                                        low: 'bg-yellow-200 text-yellow-800',
                                                        'very-low': 'bg-green-100 text-green-800',
                                                    }[riskInfo.color]
                                                }`}
                                            >
                                                {riskInfo.level} ({item.probability * item.impact}/25)
                                            </td>
                                            <td
                                                className={`border border-black p-2 ${
                                                    {
                                                        draft: 'bg-yellow-100 text-yellow-800',
                                                        warning: 'bg-yellow-100 text-yellow-800',
                                                        success: 'bg-green-100 text-green-800',
                                                        danger: 'bg-red-100 text-red-800',
                                                        secondary: 'bg-gray-100 text-gray-800',
                                                    }[validationInfo.color]
                                                }`}
                                            >
                                                {validationInfo.icon} {validationInfo.label}
                                            </td>
                                            <td className="border border-black p-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    {' '}
                                                    {/* MODIFIKASI: Tambahkan justify-center dan gap-1 */}
                                                    <Link
                                                        href={route('identify-risk.show', item.id)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-300 text-green-900 hover:bg-green-500 hover:text-white"
                                                        title="Detail"
                                                    >
                                                        <Eye size={20} />
                                                    </Link>
                                                    {/* Admin: hanya lihat detail */}
                                                    {!isAdmin && (
                                                        <>
                                                            {/* Owner Risk: kirim/edit/hapus sesuai permission */}
                                                            {isOwnerRisk && permissions?.canSubmit && canShowSubmit(item) && (
                                                                <button
                                                                    onClick={() => submitItem(item)}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white"
                                                                    title="Kirim"
                                                                >
                                                                    <Upload size={20} />
                                                                </button>
                                                            )}
                                                            {isOwnerRisk && permissions?.canEdit && canShowEdit(item) && (
                                                                <Link
                                                                    href={route('identify-risk.edit', item.id)}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil size={20} />
                                                                </Link>
                                                            )}
                                                            {isOwnerRisk && permissions?.canDelete && item.validation_status === 'draft' && (
                                                                <button
                                                                    onClick={() => deleteItem(item)}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-500 hover:text-white"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            )}
                                                            {/* Super Admin: hanya setujui/tolak */}
                                                            {isSuperAdmin &&
                                                                showValidationActions &&
                                                                (item.validation_status === 'submitted' || item.validation_status === 'pending') && (
                                                                    <>
                                                                        {permissions?.canApprove && (
                                                                            <button
                                                                                onClick={() => approveItem(item)}
                                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 hover:bg-teal-500 hover:text-white"
                                                                                title="Setujui"
                                                                            >
                                                                                <CircleCheck size={20} />
                                                                            </button>
                                                                        )}
                                                                        {permissions?.canReject && (
                                                                            <button
                                                                                onClick={() => rejectItem(item)}
                                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-500 hover:text-white"
                                                                                title="Revisi"
                                                                            >
                                                                                <X size={20} />
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                        ) : (
                            <tr>
                                <td colSpan={10} className="empty-state p-4 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Search size={40} className="empty-icon" />
                                        <h3 className="mt-2 text-lg">Tidak Ada Risiko Ditemukan</h3>
                                    </div>
                                    <p className="mt-2">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'Tidak ada risiko yang sesuai dengan filter atau pencarian Anda.'
                                            : 'Belum ada risiko yang dibuat. Mulai dengan menambah risiko baru.'}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {identifyRisks.links && <Pagination links={identifyRisks.links} />}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs} children={page} />;
