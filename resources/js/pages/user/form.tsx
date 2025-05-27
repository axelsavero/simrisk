// resources/js/Pages/User/Form.tsx

import { useForm, Head, Link } from '@inertiajs/react'; 
import { User } from '@/types';
import React from 'react'; 

interface FormProps {
    allRoles: string[];
    user?: User | null;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    roles: string[];
}

export default function Form({ allRoles, user = null }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles?.map(role => role.name) || [],
    });

    function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value, checked } = e.target;
        if (checked) {
            setData('roles', [...data.roles, value]);
        } else {
            setData('roles', data.roles.filter((role) => role !== value));
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(`/user/manage/${user.id}`);
        } else {
            post('/user/manage');
        }
    }

    return (
        <>
            <Head title={user ? 'Edit User' : 'Tambah User'} />
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <h3>{user ? 'Edit User' : 'Tambah User Baru'}</h3>
                        <form onSubmit={submit}>
                            <div className="mb-3">
                                <label className="form-label">Nama</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="form-control" />
                                {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="form-control" />
                                {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="form-control" />
                                <small className="form-text text-muted">
                                    {user ? 'Kosongkan jika tidak ingin mengubah password.' : 'Minimal 8 karakter.'}
                                </small>
                                {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Roles</label>
                                {allRoles.map(role => ( // <-- INI YANG ERROR DI TEMPAT ANDA
                                    <div className="form-check" key={role}>
                                        <input 
                                            type="checkbox" 
                                            value={role} 
                                            checked={data.roles.includes(role)}
                                            onChange={handleCheckboxChange} 
                                            className="form-check-input" 
                                        />
                                        <label className="form-check-label">{role}</label>
                                    </div>
                                ))}
                                {errors.roles && <div className="text-danger mt-1">{errors.roles}</div>}
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <Link href="/user/manage" className="btn btn-secondary">
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}