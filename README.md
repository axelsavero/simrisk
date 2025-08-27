# 🛡️ SimRisk - Sistem Manajemen Risiko Universitas

Aplikasi web untuk manajemen risiko terintegrasi yang dirancang khusus untuk lingkungan universitas. SimRisk memungkinkan identifikasi, penilaian, mitigasi, dan monitoring risiko secara sistematis dengan dukungan workflow approval yang komprehensif.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Struktur Aplikasi](#-struktur-aplikasi)
- [Sistem Role dan Permission](#-sistem-role-dan-permission)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## ✨ Fitur Utama

### 🔐 **Sistem Autentikasi & Authorization**

- Multi-role authentication (Super Admin, Owner Risk, Pimpinan, Risk Manager)
- Role-based access control (RBAC) per unit kerja
- Session management dengan Laravel Sanctum
- Password reset dan email verification

### 📊 **Dashboard & Analytics**

- Risk matrix visualization (sebelum dan sesudah mitigasi)
- Real-time statistics dan trend analysis
- Filter data berdasarkan unit, kategori, dan periode
- Export data ke PDF dan Excel

### 🎯 **Identifikasi Risiko**

- Form identifikasi risiko yang komprehensif
- Assessment probability dan impact
- Upload bukti pendukung
- Workflow approval multi-level

### 🛠️ **Manajemen Mitigasi**

- Perencanaan strategi mitigasi
- Progress tracking dan monitoring
- Upload bukti implementasi
- Status tracking (draft, submitted, approved, rejected)

### 🎯 **Sasaran Strategis**

- Sasaran universitas dan unit
- Progress tracking per unit
- KPI monitoring
- Integration dengan risk management

### 👥 **User Management**

- Manajemen user per unit
- Role assignment
- Integration dengan SIPEG (Sistem Informasi Kepegawaian)
- Profile management

### 📈 **Laporan & Reporting**

- Risk matrix reports
- Mitigation progress reports
- Unit performance reports
- Export functionality (PDF/Excel)

## 🛠️ Teknologi yang Digunakan

### **Backend**

- **Laravel 12** - PHP Framework
- **PHP 8.2+** - Programming Language
- **MySQL/PostgreSQL** - Database
- **Laravel Sanctum** - API Authentication
- **Spatie Laravel Permission** - Role & Permission Management
- **Inertia.js** - Full-stack Framework

### **Frontend**

- **React 19** - JavaScript Library
- **TypeScript** - Type Safety
- **Tailwind CSS 4** - CSS Framework
- **Radix UI** - Component Library
- **Framer Motion** - Animation
- **Lucide React** - Icons

### **Development Tools**

- **Vite** - Build Tool
- **ESLint & Prettier** - Code Quality
- **Pest** - Testing Framework
- **Laravel Sail** - Docker Development

## 💻 Persyaratan Sistem

- **PHP**: 8.2 atau lebih tinggi
- **Node.js**: 18 atau lebih tinggi
- **Composer**: 2.0 atau lebih tinggi
- **MySQL**: 8.0 atau PostgreSQL 13
- **Web Server**: Apache/Nginx
- **Memory**: Minimal 512MB RAM
- **Storage**: Minimal 1GB free space

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-username/simrisk.git
cd simrisk
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

```bash
# Configure database in .env file
# Run migrations
php artisan migrate

# Seed database with initial data
php artisan db:seed
```

### 5. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 6. Start Development Server

```bash
# Using Laravel Sail (Docker)
./vendor/bin/sail up

# Using PHP built-in server
php artisan serve
```

## ⚙️ Konfigurasi

### Environment Variables

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simrisk
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# SIPEG Integration
SIPEG_API_URL=http://10.255.0.143/apisipeg/api
SIPEG_API_TOKEN=your_token_here
```

### File Storage

```bash
# Create storage link
php artisan storage:link

# Set proper permissions
chmod -R 775 storage bootstrap/cache
```

## 📁 Struktur Aplikasi

```
simrisk/
├── app/
│   ├── Http/Controllers/          # Controllers
│   │   ├── Auth/                 # Authentication controllers
│   │   ├── DashboardController.php
│   │   ├── IdentifyRiskController.php
│   │   ├── MitigasiController.php
│   │   ├── SasaranUnitController.php
│   │   ├── SasaranUnivController.php
│   │   ├── LaporanController.php
│   │   ├── UserManageController.php
│   │   └── SipegProxyController.php
│   ├── Models/                   # Eloquent models
│   ├── Mail/                     # Mail classes
│   └── Providers/                # Service providers
├── database/
│   ├── migrations/               # Database migrations
│   ├── seeders/                  # Database seeders
│   └── factories/                # Model factories
├── resources/
│   ├── js/
│   │   ├── pages/                # React pages
│   │   ├── components/           # React components
│   │   ├── layouts/              # Layout components
│   │   └── types/                # TypeScript types
│   └── css/                      # Stylesheets
├── routes/                       # Route definitions
├── storage/                      # File storage
└── tests/                        # Test files
```

## 🔐 Sistem Role dan Permission

### **Super Admin**

- Akses penuh ke semua fitur
- Manajemen user dan role
- Approval semua risiko dan mitigasi
- Export dan reporting

### **Owner Risk**

- Membuat dan mengelola risiko
- Membuat rencana mitigasi
- Melihat data unit sendiri
- Submit untuk approval

### **Pimpinan**

- Melihat data unit yang dipimpin
- Approval risiko dan mitigasi
- Monitoring progress
- Export laporan unit

## 📚 API Documentation

### Authentication Endpoints

```http
POST /login                    # User login
POST /logout                   # User logout
POST /forgot-password          # Password reset request
POST /reset-password           # Password reset
```

### Risk Management Endpoints

```http
GET    /identify-risk          # List risks
POST   /identify-risk          # Create risk
GET    /identify-risk/{id}     # Get risk detail
PUT    /identify-risk/{id}     # Update risk
DELETE /identify-risk/{id}     # Delete risk
POST   /identify-risk/{id}/submit    # Submit for approval
POST   /identify-risk/{id}/approve   # Approve risk
POST   /identify-risk/{id}/reject    # Reject risk
```

### Mitigation Endpoints

```http
GET    /mitigasi               # List mitigations
POST   /mitigasi               # Create mitigation
GET    /mitigasi/{id}          # Get mitigation detail
PUT    /mitigasi/{id}          # Update mitigation
DELETE /mitigasi/{id}          # Delete mitigation
PATCH  /mitigasi/{id}/progress # Update progress
POST   /mitigasi/{id}/submit   # Submit for approval
POST   /mitigasi/{id}/approve  # Approve mitigation
POST   /mitigasi/{id}/reject   # Reject mitigation
```

### User Management Endpoints

```http
GET    /user/manage            # List users (Super Admin only)
POST   /user/manage            # Create user
GET    /user/manage/{id}/edit  # Edit user form
PUT    /user/manage/{id}       # Update user
DELETE /user/manage/{id}       # Delete user
```

## 📖 Documentation

### Development Documentation

- [Risk Management System](./docs/RISK_MANAGEMENT.md) - Dokumentasi sistem manajemen risiko
- [User Unit Data Fix](./docs/006_fix_user_unit_data.md) - Perbaikan data unit user di frontend

### API Integration

- **SIPEG Integration**: Integrasi dengan Sistem Informasi Kepegawaian
- **Unit Management**: Manajemen unit kerja dan pegawai
- **Role-based Access**: Kontrol akses berdasarkan role dan unit

## 🧪 Testing

### Run Tests

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=IdentifyRiskTest

# Run with coverage
php artisan test --coverage
```

### Test Structure

```
tests/
├── Feature/                   # Feature tests
│   ├── Auth/                 # Authentication tests
│   ├── DashboardTest.php     # Dashboard tests
│   └── IdentifyRiskTest.php  # Risk management tests
└── Unit/                     # Unit tests
```

## 🚀 Deployment

### Production Setup

```bash
# Set environment to production
APP_ENV=production
APP_DEBUG=false

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build assets
npm run build

# Set proper permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Docker Deployment

```bash
# Build Docker image
docker build -t simrisk .

# Run container
docker run -d -p 80:80 simrisk
```

## 🤝 Kontribusi

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards

- Follow PSR-12 coding standards
- Write tests for new features
- Update documentation
- Use conventional commits

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **Email**: support@simrisk.com
- **Documentation**: [docs.simrisk.com](https://docs.simrisk.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/simrisk/issues)

---

**SimRisk** - Empowering universities with comprehensive risk management solutions. 🎓

**© 2025 Genta. All rights reserved.**
