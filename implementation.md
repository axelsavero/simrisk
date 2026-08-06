# Implementation Plan: Revisi & Debugging SIMRISK

Dokumen ini berisi rencana implementasi untuk 8 poin revisi dan perbaikan bug pada project SIMRISK.

## User Review Required

> [!IMPORTANT]
> - **Poin 3 (Reset Unit)**: Proses ini akan menggunakan `DB::table('units')->delete()` atau `Unit::truncate()`. Pastikan tidak ada *foreign key constraint* yang akan mencegah penghapusan data secara cascade jika tabel unit berelasi dengan tabel lain (seperti `users`). Jika ada, kita perlu menyesuaikan strateginya agar relasi tetap aman atau di set null.
> - **Poin 7 (Shadcn UI Data Table)**: Penggantian seluruh tabel menggunakan `DataTable` dari Shadcn UI akan mengubah *source code* di banyak halaman (`index.tsx` di berbagai modul). Kita akan memastikan komponen badge dan button yang ada tetap dipertahankan dengan merender kustom sel (cell rendering) pada Shadcn.

## Open Questions

> [!WARNING]
> - Untuk **Poin 7**, apakah Anda menggunakan package `@tanstack/react-table` (DataTable kompleks dengan pagination, sorting, filtering built-in Shadcn) atau sekadar menggunakan komponen presentasional `<Table>`, `<TableHeader>`, `<TableRow>`, dll dari Shadcn? (Saya asumsikan kita akan menggunakan komponen presentasional `<Table>` Shadcn agar lebih mudah mempertahankan struktur saat ini, kecuali Anda meminta fitur sorting/filtering DataTable secara eksplisit).
> - Untuk **Poin 5**, di halaman "Validasi" yang mana tepatnya (apakah halaman *Manajemen Risiko* atau *Mitigasi*)? Saya asumsikan halaman utama validasi (seperti *Identify Risk Index/Validasi*).

---

## Proposed Changes

### 1. Dashboard (Filtering Tahun)
Mengubah opsi filter tahun agar selalu menampilkan 5 tahun terakhir (termasuk tahun ini) terlepas dari ada atau tidaknya data, sehingga dropdown tahun saat ini tidak hilang.

#### [MODIFY] [DashboardController.php](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/app/Http/Controllers/DashboardController.php)
- Pada method `getFilterOptions()`, ubah logika pemanggilan `tahuns` yang sebelumnya `IdentifyRisk::distinct()->pluck('tahun')` menjadi rentang statis/dinamis 5 tahun terakhir (contoh: 2022 - 2026).

### 2. Dashboard (Modal Detail Mitigasi)
Memperbaiki penulisan kolom status (contoh: "sedang_berjalan" menjadi "Sedang Berjalan").

#### [MODIFY] [dashboard/index.tsx](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/resources/js/pages/dashboard/index.tsx)
- Menambahkan fungsi utility (atau replace string) untuk mengubah `_` menjadi spasi dan mengkapitalisasi setiap kata pada kolom status di modal.

### 3. Sinkronisasi Data Unit
Menghapus seluruh data unit yang ada sebelum menyimpan data baru dari SIPEG.

#### [MODIFY] [SipegProxyController.php](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/app/Http/Controllers/SipegProxyController.php)
- Pada method `sinkronUnit()`, tambahkan operasi `\App\Models\Unit::query()->delete();` di dalam blok `DB::beginTransaction()` sebelum melakukan perulangan insert/update data dari API.

### 4. Manajemen Admin & Operator
Menambahkan kolom Email, Role, dan tombol Detail.

#### [MODIFY] [UserManageController.php](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/app/Http/Controllers/UserManageController.php)
- Memastikan response user me-*load* field `email` dan `roles`.
#### [MODIFY] [manage.tsx](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/resources/js/pages/user/manage.tsx)
- Menambahkan kolom `Email` dan `Role` pada tag `<th>` dan `<td>`.
- Menambahkan Button `Detail` (icon View/Eye) bersebelahan dengan Edit & Delete.
#### [MODIFY] [operator.tsx](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/resources/js/pages/user/operator.tsx)
- Menambahkan kolom `Email` dan `Role` pada tag `<th>` dan `<td>`.
- Menambahkan Button `Detail` (icon View/Eye) bersebelahan dengan Edit & Delete.

### 5. Validasi: Card Total Data Bug
Memperbaiki perhitungan "Total Data" yang saat ini hanya menghitung data per halaman (pagination).

#### [MODIFY] Controller Validasi (IdentifyRiskController.php / MitigasiController.php)
- Mengambil nilai `total()` dari object paginator milik Laravel (`$data->total()`), bukan dari `$data->count()` (yang hanya mengembalikan jumlah data di halaman aktif).

### 6. Validasi: Sort By Status (Utamakan Belum Diproses)
Menampilkan data dengan status belum diproses (`pending`, `submitted`) di paling atas.

#### [MODIFY] Controller Validasi (IdentifyRiskController.php / MitigasiController.php)
- Menambahkan kueri *sorting custom* menggunakan `orderByRaw("CASE WHEN validation_status IN ('pending', 'submitted') THEN 0 ELSE 1 END")` sebelum `orderBy('created_at', 'desc')`.

### 7. Shadcn UI Data Table
Mengganti tag HTML `<table>` native dengan komponen Shadcn UI.

#### [MODIFY] Berbagai File Halaman (index.tsx, manage.tsx, operator.tsx, dll)
- Mengimpor komponen dari `@/components/ui/table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`).
- Mengganti tag `<table>` menjadi `<Table>`, `<thead>` menjadi `<TableHeader>`, dst, dengan tetap mempertahankan isi *button* dan *badge* di dalamnya.

### 8. Detail Identifikasi Risiko
Menambahkan informasi Unit Kerja di halaman detail identifikasi risiko.

#### [MODIFY] [identifyrisk/show.tsx](file:///home/foxie/Documents/Aplikasi%20Pustikom/simrisk/resources/js/pages/identifyrisk/show.tsx)
- Menambahkan satu elemen informasi pada grid "Informasi Dasar" untuk menampilkan `identifyRisk.unit_kerja` atau data unit relasional (misal `identifyRisk.user.unit.nama_unit`).

---

## Verification Plan

### Automated / Backend Tests
- Menjalankan migrasi/seeder jika ada perubahan struktur, serta menguji endpoint API validasi dan sinkronisasi SIPEG dengan Postman / *browser network tab*.

### Manual Verification
1. **Filtering Tahun**: Cek halaman dashboard apakah tahun 2026, 2025, 2024, dst muncul.
2. **Modal Mitigasi**: Buka dashboard, klik salah satu mitigasi, pastikan status tertulis "Sedang Berjalan".
3. **Reset Unit**: Lakukan sinkronisasi unit, pastikan tidak ada data duplikat dan ID lama terhapus (cek database).
4. **Manage User**: Masuk ke menu admin/operator, pastikan kolom Email, Role, dan tombol Detail muncul.
5. **Card Total Data**: Buka halaman validasi, cek dashboard/card, pastikan total mencerminkan keseluruhan data (misal 50), bukan 10 (data per page).
6. **Filter Validasi**: Pastikan tabel validasi memunculkan status *pending* di urutan teratas.
7. **Shadcn Tables**: Periksa *styling* tabel, pastikan sesuai dengan desain sistem Shadcn UI.
8. **Detail Risiko**: Pastikan unit kerja muncul di card Informasi Dasar halaman `identify-risk/show`.
