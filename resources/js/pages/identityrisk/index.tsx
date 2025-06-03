// resources/js/pages/IdentityRisk/Index.tsx
import AppLayout from '@/layouts/app-layout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // <-- TAMBAHKAN BARIS IMPOR INI
import { IdentityRisk, PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

// Komponen untuk Paginasi (contoh sederhana)
const Pagination = ({ links }: { links: Array<{ url: string | null; label: string; active: boolean }> }) => {
    return (
        <nav>
            <ul className="pagination">
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                        {link.url ? (
                            <Link className="page-link" href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                            <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default function Index() {
    const { identityRisks, flash } = usePage<PageProps>().props;

    if (!identityRisks) {
        return (
            <AuthenticatedLayout title="Identifikasi Risiko">
                <Head title="Daftar Identifikasi Risiko" />
                <p>Data tidak tersedia.</p>
            </AuthenticatedLayout>
        );
    }

    function deleteItem(item: IdentityRisk) {
        if (confirm(`Yakin ingin menghapus identifikasi risiko "${item.id_identity}"?`)) {
            router.delete(route('identity-risk.destroy', item.id));
        }
    }

    return (
        <AuthenticatedLayout title="Identifikasi Risiko">
            <Head title="Daftar Identifikasi Risiko" />

            <div className="container py-4">
                {flash?.success && (
                    <div className="alert alert-success" role="alert">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="alert alert-danger" role="alert">
                        {flash.error}
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1>Daftar Identifikasi Risiko</h1>
                    <Link href={route('identity-risk.create')} className="btn btn-primary">
                        Tambah Identifikasi Baru
                    </Link>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table-bordered table-striped table">
                                <thead>
                                    <tr>
                                        <th>ID Unik</th>
                                        <th>Kategori Risiko</th>
                                        <th>Probabilitas</th>
                                        <th>Impact</th>
                                        <th>Level</th>
                                        <th>Status</th>
                                        <th>Tgl Mulai</th>
                                        <th>Tgl Selesai</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {identityRisks.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id_identity}</td>
                                            <td>{item.risk_category}</td>
                                            <td>{item.probability}</td>
                                            <td>{item.impact}</td>
                                            <td>{item.level}</td>
                                            <td>{item.status ? 'Aktif' : 'Tidak Aktif'}</td>
                                            <td>{item.identification_date_start}</td>
                                            <td>{item.identification_date_end}</td>
                                            <td>
                                                <Link href={route('identity-risk.edit', item.id)} className="btn btn-sm btn-info me-2 mb-1">
                                                    Edit
                                                </Link>
                                                <button onClick={() => deleteItem(item)} className="btn btn-sm btn-danger mb-1">
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {identityRisks.data.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="text-center">
                                                Belum ada data identifikasi risiko.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {identityRisks.links && identityRisks.links.length > 3 && <Pagination links={identityRisks.links} />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout children={page} title="Judul Halaman Anda" />;
