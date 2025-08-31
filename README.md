# 🚪 FloodBar Admin Panel

Comprehensive admin panel untuk mengelola sistem penjualan FloodBar (sekat pintu anti banjir) dengan manajemen ongkos kirim terintegrasi. Dibangun menggunakan Next.js 14 dengan TypeScript.

## ✨ Fitur Utama

### 🔐 Authentication System
- **NextAuth.js integration** - Login system yang aman
- **Role-based access** - Admin, editor, viewer roles
- **Session management** - Persistent login sessions
- **Protected routes** - Middleware untuk route protection

### 📊 Admin Dashboard
- **Overview statistics** - Ringkasan data sistem
- **Quick actions** - Aksi cepat untuk tugas umum
- **Navigation sidebar** - Menu navigasi yang intuitif
- **Responsive design** - Optimal untuk desktop dan mobile

### 🎨 Landing Page Editor
- **Hero section editor** - Edit banner utama
- **Product features management** - Kelola fitur produk
- **Contact information** - Update info kontak
- **Real-time preview** - Preview perubahan langsung

### 👥 User Management
- **User CRUD operations** - Create, read, update, delete users
- **Role assignment** - Atur role user (admin, editor, viewer)
- **Status management** - Aktifkan/nonaktifkan user
- **Bulk operations** - Operasi massal untuk multiple users

### ⚙️ System Settings
- **Site configuration** - Pengaturan dasar sistem
- **Email notifications** - Konfigurasi notifikasi
- **Maintenance mode** - Mode maintenance system
- **Backup settings** - Pengaturan backup otomatis

### 📦 Product Configuration
- **Dynamic pricing** - Kalkulasi harga berdasarkan dimensi
- **Shipping settings** - Konfigurasi pengiriman
- **Weight calculation** - Perhitungan berat otomatis
- **Warehouse management** - Info gudang dan pickup

### 🚚 Shipping Rates Management
- **CSV Import/Export** - Upload data ongkir dari file CSV
- **Bulk operations** - Import ribuan data sekaligus
- **CRUD operations** - Edit, hapus data ongkir
- **Search & Filter** - Pencarian data yang powerful
- **Modal editing** - Edit data dengan modal yang user-friendly
- **Pagination** - Navigasi data yang efisien

### 🌐 Public Landing Page
- **Responsive design** - Optimal untuk semua device
- **Dynamic content** - Konten dari admin panel
- **SEO optimized** - Meta tags dan struktur SEO
- **Fast loading** - Optimasi performance

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type-safe JavaScript development  
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Prisma ORM** - Type-safe database client
- **MySQL** - Relational database
- **NextAuth.js** - Complete authentication solution
- **bcryptjs** - Password hashing
- **JSON Web Tokens** - Secure token-based auth

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm atau yarn

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/jharrvis/floodbar-admin.git
cd floodbar-admin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local dengan konfigurasi database dan auth
```

4. **Setup database:**
```bash
# Untuk setup database baru
node scripts/setup-database.js

# Atau jika sudah ada database
npx prisma db push
npx prisma generate
```

5. **Jalankan development server:**
```bash
npm run dev
```

6. **Buka browser:**
```
http://localhost:3000 (atau port yang tersedia)
```

### 🔑 Default Login
**Email:** admin@floodbar.com  
**Password:** admin123

## Struktur Folder

```
floodbar/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── login/          # Login page
│   │   ├── landing/        # Landing page editor
│   │   ├── users/          # User management
│   │   ├── settings/       # Settings page
│   │   └── layout.tsx      # Admin layout
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── landing/        # Landing page data API
│   │   └── users/          # User management API
│   ├── landing/            # Public landing page
│   └── globals.css         # Global styles
├── components/
│   └── admin/              # Admin components
│       ├── Sidebar.tsx     # Navigation sidebar
│       └── Header.tsx      # Header component
├── lib/
│   └── auth.ts             # Auth configuration
└── package.json
```

## Login Credentials

**Email:** admin@floodbar.com  
**Password:** admin123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Landing Page
- `GET /api/landing` - Get landing page data
- `PUT /api/landing` - Update landing page data

### User Management  
- `GET /api/users` - Get all users (with pagination)
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user data
- `DELETE /api/users` - Delete user

### Product Configuration
- `GET /api/product-config` - Get product configuration
- `PUT /api/product-config` - Update product configuration
- `POST /api/calculate` - Calculate shipping price

### Shipping Rates
- `GET /api/shipping-rates` - Get shipping rates (with pagination & search)
- `PUT /api/shipping-rates` - Update shipping rate
- `DELETE /api/shipping-rates` - Delete shipping rate or clear all
- `POST /api/shipping-rates/upload` - Bulk import from CSV

## 📖 Usage Guide

### Admin Panel Navigation

1. **🔐 Login**: Akses `/admin/login` dengan credentials admin
2. **📊 Dashboard**: Overview dan statistik di `/admin`
3. **🎨 Landing Page**: Edit konten publik di `/admin/landing`
4. **📦 Product Config**: Kelola harga dan pengiriman di `/admin/product`
5. **🚚 Shipping Rates**: Manajemen ongkir di `/admin/shipping`
   - Import CSV file ongkir
   - Edit data ongkir individual
   - Cari dan filter data
   - Pagination untuk data besar
6. **👥 User Management**: Atur user di `/admin/users`
7. **⚙️ Settings**: Konfigurasi sistem di `/admin/settings`
8. **🌐 Preview**: Lihat hasil di `/landing`

### Shipping Rates Management

1. **CSV Import:**
   - Pilih file CSV dengan format Indah Cargo
   - Upload dan tunggu proses import
   - Review statistik import (added, updated, errors)

2. **Edit Data:**
   - Klik tombol "Edit" pada data yang ingin diubah
   - Modal edit akan terbuka dengan semua field
   - Update data dan klik "Simpan"

3. **Search & Filter:**
   - Gunakan search box untuk cari berdasarkan tujuan, asal, atau via
   - Pagination otomatis untuk performa optimal

## 🔒 Security Features

- **Authentication middleware** - Proteksi route dengan NextAuth.js
- **Password encryption** - Bcrypt hashing untuk password
- **CSRF protection** - Built-in CSRF protection
- **Role-based access** - Kontrol akses berdasarkan role user
- **Session management** - Secure session handling
- **Input validation** - Server-side validation untuk semua input
- **SQL injection protection** - Prisma ORM mencegah SQL injection

## 🔧 Development

### Commands

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Start production server  
npm start

# Code linting
npm run lint

# Database operations
npx prisma db push     # Push schema ke database
npx prisma generate    # Generate Prisma client
npx prisma studio      # Database browser GUI
```

### Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional
NODE_ENV="development"
```

### Database Schema

The project uses Prisma ORM with the following main models:
- **Users** - Admin users dengan role-based access
- **LandingPage** - Konten halaman publik
- **Settings** - Konfigurasi sistem
- **ProductConfig** - Pengaturan produk dan ongkir
- **ShippingRate** - Data ongkos kirim (65k+ records support)

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk pertanyaan atau support, silakan buat issue di GitHub repository.

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**# Force deployment trigger 31 Aug 2025 22:36:29
