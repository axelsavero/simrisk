import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Download, Eye, FileText, FileX, Info, Paperclip, Pencil, Undo2 } from 'lucide-react';

interface Props {
	sasaranUnit: any;
}

export default function Show({ sasaranUnit }: Props) {
	const breadcrumbs: BreadcrumbItem[] = [
		{ title: 'Dashboard', href: '/dashboard' },
		{ title: 'Sasaran Unit', href: route('sasaran-unit.index') },
		{ title: 'Detail Dokumen', href: '#' },
	];

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Detail Sasaran Unit" />

			<div className="w-full px-6 py-8">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Detail Sasaran Unit</h2>
					<div className="flex gap-2">
						<Link
							href={route('sasaran-unit.edit', sasaranUnit.id_sasaran_unit)}
							className="flex items-center gap-2 rounded-md bg-yellow-600 px-6 py-3 font-medium text-white transition hover:bg-yellow-700"
						>
							<Pencil />
							Edit
						</Link>
						<Link
							href={route('sasaran-unit.index')}
							className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
						>
							<Undo2 />
							Kembali
						</Link>
					</div>
				</div>

				<div className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md">
					<div className="mb-6 flex items-center gap-3">
						<FileText className="text-3xl" />
						<div>
							<h3 className="text-xl font-semibold text-gray-900">{sasaranUnit.nama_dokumen || 'Dokumen Sasaran Unit'}</h3>
							<p className="text-sm text-gray-500">
								ID: {sasaranUnit.id_sasaran_unit} • Dibuat: {new Date(sasaranUnit.created_at).toLocaleDateString('id-ID')}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="rounded-lg border p-4">
							<h4 className="mb-3 flex items-center gap-2 text-base font-semibold"><Info /> Informasi Dokumen</h4>
							<div className="space-y-2 text-sm">
								<p><strong>Kategori:</strong> {sasaranUnit.kategori}</p>
								<p><strong>Nama Dokumen:</strong> {sasaranUnit.nama_dokumen || '-'}</p>
								<p><strong>Nomor Dokumen:</strong> {sasaranUnit.nomor_dokumen || '-'}</p>
								<p><strong>Tanggal Dokumen:</strong> {sasaranUnit.tanggal_dokumen ? new Date(sasaranUnit.tanggal_dokumen).toLocaleDateString('id-ID') : '-'}</p>
							</div>
						</div>

						<div className="rounded-lg border p-4">
							<h4 className="mb-3 flex items-center gap-2 text-base font-semibold"><ClipboardList /> Dokumen Terkait</h4>
							{sasaranUnit.file_path ? (
								<a
									href={`/storage/${sasaranUnit.file_path}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
								>
									<Eye />
									Lihat File
								</a>
							) : (
								<div className="flex items-center gap-2 text-gray-500">
									<FileX />
									<span>Tidak ada file diunggah</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}


