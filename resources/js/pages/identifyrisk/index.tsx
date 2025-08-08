// resources/js/pages/identifyrisk/index.tsx
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChartColumnIncreasing,
    CheckCircle2,
    CircleCheck,
    CircleHelp,
    CirclePlus,
    ClipboardX,
    Eye,
    FilePlus,
    Hourglass,
    IdCard,
    Pencil,
    Search,
    ShieldAlert,
    SquarePen,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Validasi Input Risiko', href: route('identify-risk.index') },
];

type PageProps = {
    identifyRisks: { data: IdentifyRisk[]; links?: Array<{ url: string | null; label: string; active: boolean }> };
    flash?: any;
    auth?: any;
    permissions?: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean; canSubmit?: boolean; canValidate?: boolean; canApprove?: boolean; canReject?: boolean };
};

const Pagination = ({ links }: { links: Array<{ url: string | null; label: string; active: boolean }> }) =>
    !links || links.length <= 3 ? null : (
        <nav aria-label="Page navigation" className="pagination-wrapper">
            <ul className="pagination flex space-x-1">
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                        {link.url ? (
                            <Link className="page-link" href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                        ) : (
                            <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );

export default function Index() {
    const { identifyRisks, flash, auth, permissions } = usePage<PageProps>().props;
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (identifyRisks) setIsLoading(false);
    }, [identifyRisks]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!identifyRisks) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-white">
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
            title: 'Tolak Risiko',
            html: `
                <div class="text-left max-w-xs">
                    <div class="mb-2"><strong>Kode Risiko</strong>: ${item.id_identify}</div>
                    <div class="mb-2"><strong>Deskripsi Risiko</strong>: ${item.description}</div>
                    <div class="mb-2"><strong>Penyebab Risiko</strong>: ${
                        item.penyebab && Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => p.description).join(', ') : ''
                    }</div>
                    <div class="mb-2"><strong>Alasan</strong>:</div>
                    <textarea id="swal-reject-reason" class="swal2-textarea w-full min-w-0 max-w-[95%] min-h-[100px] resize-y" placeholder="Tuliskan alasan penolakan..."></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const reason = (document.getElementById('swal-reject-reason') as HTMLTextAreaElement)?.value;
                if (!reason?.trim()) Swal.showValidationMessage('Alasan penolakan harus diisi');
                return reason;
            },
        }).then((result) => result.isConfirmed && result.value && router.post(route('identify-risk.reject', item.id), { rejection_reason: result.value }, { preserveScroll: true }));

    const canShowEdit = (item: IdentifyRisk) => (auth?.user?.roles?.includes('super-admin') ? item.validation_status === 'draft' || item.validation_status === 'rejected' : item.validation_status === 'draft' || item.validation_status === 'rejected');
    const canShowSubmit = (item: IdentifyRisk) => (auth?.user?.roles?.includes('super-admin') ? item.validation_status === 'draft' : item.validation_status === 'draft');
    const getRiskLevelInfo = (probability: number, impact: number) => {
        const risk = probability * impact;
        return risk >= 20 ? { level: 'Tinggi', color: 'high' } : risk >= 9 ? { level: 'Sedang', color: 'medium' } : risk >= 3 ? { level: 'Rendah', color: 'low' } : { level: 'Sangat Rendah', color: 'very-low'};
    };
    const getValidationStatusInfo = (status: string) =>
        ({
            draft: { label: 'Draft', color: 'draft', icon: <SquarePen /> },
            submitted: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass /> },
            pending: { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass /> },
            approved: { label: 'Disetujui', color: 'success', icon: <CheckCircle2 /> },
            rejected: { label: 'Ditolak', color: 'danger', icon: <X /> },
            default: { label: 'Unknown', color: 'secondary', icon: <CircleHelp /> },
        }[status] || { label: 'Unknown', color: 'secondary', icon: <CircleHelp /> });

    const filteredRisks = identifyRisks.data.filter((item: IdentifyRisk) => {
        const matchesSearch = [item.id_identify, item.risk_category, item.description].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && (item.validation_status === 'pending' || item.validation_status === 'submitted')) ||
            (filterStatus !== 'pending' && item.validation_status === filterStatus);
        return matchesSearch && matchesFilter;
    });

    // Reintroduce showValidationActions
    const showValidationActions = permissions?.canValidate;

    return (
        <div className="risk-index-container w-full px-2 md:px-6 bg-white min-h-screen">
            {/* Header Section */}
            <div className="page-header flex justify-between items-center mb-6">
                <div className="header-info">
                    <h1 className="page-title flex items-center gap-2 text-2xl font-bold">
                        <ShieldAlert size={40} className="title-icon" />
                        Manajemen Risiko
                    </h1>
                    <p className="page-subtitle text-gray-600">Kelola dan pantau identifikasi risiko organisasi Anda</p>
                </div>
                {permissions?.canCreate && (
                    <Link href={route('identify-risk.create')} className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded bg-[#12745a] text-white hover:bg-[#0c4435]">
                        <CirclePlus size={28} className="btn-icon" />
                        Tambah Risiko Baru
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="stat-card flex items-center p-4 bg-white shadow rounded-lg">
                    <ChartColumnIncreasing size={40} className="stat-icon text-blue-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">{identifyRisks.data.length}</span>
                        <span className="stat-label block text-gray-600">Total Risiko</span>
                    </div>
                </div>
                <div className="stat-card flex items-center p-4 bg-white shadow rounded-lg">
                    <SquarePen size={40} className="stat-icon" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">{identifyRisks.data.filter((item) => item.validation_status === 'draft').length}</span>
                        <span className="stat-label block text-gray-600">Draft</span>
                    </div>
                </div>
                <div className="stat-card flex items-center p-4 bg-white shadow rounded-lg">
                    <Hourglass size={40} className="stat-icon text-yellow-500" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">
                            {identifyRisks.data.filter((item) => item.validation_status === 'pending' || item.validation_status === 'submitted').length}
                        </span>
                        <span className="stat-label block text-gray-600">Pending</span>
                    </div>
                </div>
                <div className="stat-card flex items-center p-4 bg-white shadow rounded-lg">
                    <CircleCheck size={40} className="stat-icon text-green-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">{identifyRisks.data.filter((item) => item.validation_status === 'approved').length}</span>
                        <span className="stat-label block text-gray-600">Disetujui</span>
                    </div>
                </div>
                <div className="stat-card flex items-center p-4 bg-white shadow rounded-lg">
                    <ClipboardX size={40} className="stat-icon text-red-600" />
                    <div className="stat-content ml-4">
                        <span className="stat-number text-2xl font-bold">{identifyRisks.data.filter((item) => item.validation_status === 'rejected').length}</span>
                        <span className="stat-label block text-gray-600">Ditolak</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="controls-section flex flex-col md:flex-row gap-4 mb-6">
                <div className="search-box relative flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID, kategori, atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12745a]"
                    />
                    <Search size={20} className="absolute right-3 top-2 text-gray-400" />
                </div>
                <div className="filter-tabs flex gap-2">
                    {['all', 'draft', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            className={`filter-tab px-4 py-2 rounded-lg ${filterStatus === status ? 'bg-[#12745a] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-[#0c4435] hover:text-white transition`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Risk Table */}
            <div className="risk-table-container w-full overflow-x-auto">
                <table className="risk-table w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">No</th>
                            <th className="p-2 text-left">Kode Risiko</th>
                            <th className="p-2 text-left">Deskripsi</th>
                            <th className="p-2 text-left">Penyebab</th>
                            <th className="p-2 text-left">Probabilitas Inherent</th>
                            <th className="p-2 text-left">Impact Inherent</th>
                            <th className="p-2 text-left">Tingkat Risiko Inherent</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRisks.length > 0 ? (
                            filteredRisks.map((item, index) => {
                                const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                                const validationInfo = getValidationStatusInfo(item.validation_status);
                                return (
                                    <tr key={item.id} className={`risk-row ${item.validation_status === 'draft' ? 'bg-yellow-50' : ''}`}>
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <IdCard className="id-icon text-gray-500" />
                                                {item.id_identify}
                                                {item.validation_status === 'draft' && <span className="draft-badge w-2 h-2 bg-yellow-400 rounded-full"></span>}
                                            </div>
                                            <div className={`validation-badge mt-1 px-2 py-1 rounded text-sm ${{
                                                draft: 'bg-yellow-100 text-yellow-800',
                                                warning: 'bg-yellow-100 text-yellow-800',
                                                success: 'bg-green-100 text-green-800',
                                                danger: 'bg-red-100 text-red-800',
                                                secondary: 'bg-gray-100 text-gray-800',
                                            }[validationInfo.color]}`}>
                                                {validationInfo.icon} {validationInfo.label}
                                            </div>
                                        </td>
                                        <td className="p-2">{item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}</td>
                                        <td className="p-2">{item.penyebab && Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => p.description).join(', ') : '-'}</td>
                                        <td className="p-2">{item.probability}/5</td>
                                        <td className="p-2">{item.impact}/5</td>
                                        <td className={`p-2 ${{
                                            high: 'bg-red-100 text-red-800',
                                            medium: 'bg-yellow-100 text-yellow-800',
                                            low: 'bg-yellow-200 text-yellow-800',
                                            'very-low': 'bg-green-100 text-green-800',
                                        }[riskInfo.color]}`}>
                                            {riskInfo.icon} {riskInfo.level} ({item.probability * item.impact}/25)
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="text-gray-500" />
                                                {new Date(item.identification_date_start).toLocaleDateString('id-ID')} -{' '}
                                                {new Date(item.identification_date_end).toLocaleDateString('id-ID')}
                                            </div>
                                            {item.rejection_reason && item.validation_status === 'rejected' && (
                                                <div className="rejection-reason mt-2 text-sm text-red-600">
                                                    <strong>Alasan Penolakan:</strong> {item.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Link href={route('identify-risk.show', item.id)} className="action-btn bg-[#12745a] text-white px-2 py-1 rounded hover:bg-[#0c4435]">
                                                    <Eye className="inline" /> Detail
                                                </Link>
                                                {permissions?.canSubmit && canShowSubmit(item) && (
                                                    <button onClick={() => submitItem(item)} className="action-btn bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                                                        <Upload className="inline" /> Kirim
                                                    </button>
                                                )}
                                                {permissions?.canEdit && canShowEdit(item) && (
                                                    <Link href={route('identify-risk.edit', item.id)} className="action-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                                        <Pencil className="inline" /> Edit
                                                    </Link>
                                                )}
                                                {permissions?.canDelete && item.validation_status === 'draft' && (
                                                    <button onClick={() => deleteItem(item)} className="action-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                                        <Trash2 className="inline" /> Hapus
                                                    </button>
                                                )}
                                                {showValidationActions && (item.validation_status === 'submitted' || item.validation_status === 'pending') && (
                                                    <>
                                                        {permissions?.canApprove && (
                                                            <button onClick={() => approveItem(item)} className="action-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                                                <CircleCheck className="inline" /> Setujui
                                                            </button>
                                                        )}
                                                        {permissions?.canReject && (
                                                            <button onClick={() => rejectItem(item)} className="action-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                                                <X className="inline" /> Tolak
                                                            </button>
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
                                    {!searchTerm && filterStatus === 'all' && permissions?.canCreate && (
                                        <div className="mt-4">
                                            <Link href={route('identify-risk.create')} className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded bg-[#12745a] text-white hover:bg-[#0c4435]">
                                                <FilePlus size={28} /> Tambah Risiko Pertama
                                            </Link>
                                        </div>
                                    )}
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
