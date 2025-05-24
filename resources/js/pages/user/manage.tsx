// resources/js/Pages/User/Manage.tsx

import { Link, Head, usePage } from '@inertiajs/react';
import { PageProps, User } from '@/types'; // <-- Import tipe kita
import { router } from '@inertiajs/react'; // <-- Import router untuk delete

// Terapkan tipe pada props yang diterima oleh halaman ini
export default function Manage({ users }: PageProps<{ users: User[] }>) {
    
    // Gunakan PageProps di usePage untuk mendapatkan auth yang type-safe
    const { auth, flash } = usePage<PageProps>().props;

    const isSuperAdmin = auth.user?.roles?.includes('super-admin');

    function deleteUser(user: User) { // <-- Beri tipe pada parameter user
        if (confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) {
            // Gunakan `route()` helper jika ada, atau path manual
            router.delete(`/user/manage/${user.id}`);
        }
    }

    return (
        <>
            <Head title="User Management" />
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-10">

                        {/* Tampilkan flash message jika ada */}
                        {/* // Gunakan optional chaining `?.` untuk keamanan */}
                        {flash?.success && (
                            <div className="alert alert-success">{flash.success}</div>
                        )}
                        {flash?.error && (
                            <div className="alert alert-danger">{flash.error}</div>
                        )}
                        

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>User Management</h3>
                            {isSuperAdmin && (
                                <Link href="/user/manage/create" className="btn btn-primary">
                                    Tambah User Baru
                                </Link>
                            )}
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Roles</th>
                                            {isSuperAdmin && <th>Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user: User) => ( // <-- Beri tipe pada user di dalam map
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.roles.join(', ')}</td>
                                                {isSuperAdmin && (
                                                    <td>
                                                        <Link href={`/user/manage/${user.id}/edit`} className="btn btn-sm btn-info me-2">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => deleteUser(user)} className="btn btn-sm btn-danger">
                                                            Hapus
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}