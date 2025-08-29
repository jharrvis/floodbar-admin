# Floodbar Admin Panel

Admin panel untuk mengelola halaman penjualan FloodBar (sekat pintu anti banjir) menggunakan Next.js 14 dengan TypeScript.

## Fitur

### 1. Login Sistem
- Autentikasi menggunakan NextAuth.js
- Login dengan email/password
- Session management
- Redirect ke halaman admin setelah login

### 2. Dashboard Admin
- Overview statistik
- Quick actions
- Navigasi menu

### 3. Landing Page Editor
- Edit konten hero section
- Manage fitur produk
- Edit informasi kontak
- Preview perubahan

### 4. User Management
- Tambah, edit, hapus user
- Role management (admin, editor, viewer)
- Status user (active, inactive)

### 5. Pengaturan
- Konfigurasi sistem
- Ubah password admin
- Pengaturan notifikasi

### 6. Landing Page Publik
- Halaman penjualan FloodBar
- Responsive design
- Konten dinamis dari admin panel

## Teknologi

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **MySQL** - Database
- **Lucide React** - Icons

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
node scripts/setup-database.js
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser di http://localhost:3009

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

## API Endpoints

- `GET /api/landing` - Get landing page data
- `PUT /api/landing` - Update landing page data
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users` - Delete user

## Penggunaan

1. **Login**: Akses `/admin/login` dan masuk dengan credentials admin
2. **Dashboard**: Lihat overview di `/admin`
3. **Edit Landing**: Kelola konten di `/admin/landing`
4. **Manage Users**: Atur user di `/admin/users`
5. **Settings**: Konfigurasi sistem di `/admin/settings`
6. **Preview**: Lihat hasil di `/landing`

## Fitur Keamanan

- Protected routes dengan middleware
- Password hashing dengan bcrypt
- Session-based authentication
- Role-based access control

## Development

```bash
# Development
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```