# FloodBar Payment System - Setup Guide

## 🎯 Sistem Pembayaran & Email Sudah Diperbaiki

### ✅ **Perbaikan yang Telah Dilakukan**

1. **Gmail SMTP settings dipindahkan ke Admin Panel**
2. **Xendit API key diambil dari database (bukan environment variables)**  
3. **Sistem benar-benar terintegrasi dengan Xendit API** (bukan mock lagi)
4. **Email notification menggunakan settings dari database**

---

## 🔧 **Cara Mengaktifkan Sistem Payment & Email**

### **Step 1: Setup Xendit Payment Gateway**

1. **Register di Xendit Dashboard**
   - Kunjungi: https://dashboard.xendit.co/register
   - Daftar dengan email bisnis Anda

2. **Dapatkan API Keys**
   - Login ke Xendit Dashboard
   - Pilih: **Settings** > **Developers** > **API Keys**
   - Copy **Secret Key** (format: `xnd_development_...` atau `xnd_production_...`)

3. **Setup di Admin Panel FloodBar**
   - Login ke admin panel: `http://your-domain.com/admin` 
   - Pilih: **Pengaturan Pembayaran**
   - Aktifkan: **✓ Aktifkan Xendit Payment Gateway**
   - Paste **Xendit Secret API Key**
   - Pilih **Environment**: `Sandbox` (testing) atau `Production` (live)
   - Isi **Webhook Verification Token** (opsional)
   - Klik **Simpan Pengaturan**

### **Step 2: Setup Gmail SMTP untuk Email Invoice**

1. **Siapkan Gmail App Password**
   - Masuk ke Google Account Settings
   - Aktifkan **2-Step Verification**
   - Pilih: **Security** > **App passwords**
   - Generate password untuk "Mail"
   - Copy 16-character password yang dihasilkan

2. **Setup di Admin Panel FloodBar**  
   - Di halaman **Pengaturan Pembayaran**
   - Scroll ke section **Konfigurasi Email SMTP**
   - Aktifkan: **✓ Aktifkan Email Notification**
   - Isi **Gmail Email Address**: `your-business@gmail.com`
   - Isi **Gmail App Password**: paste 16-char password dari Google
   - Isi **Sender Name**: `FloodBar` atau nama bisnis Anda
   - Klik **Simpan Pengaturan**

### **Step 3: Test Payment Flow**

1. **Test Order Creation**
   - Buka: `http://your-domain.com/order`
   - Isi form order lengkap
   - Pilih **Pembayaran Online (Xendit)**
   - Klik **Lanjut ke Pembayaran**

2. **Expected Results:**
   - Customer redirect ke halaman pembayaran Xendit
   - Invoice akan tampil di Xendit Dashboard
   - Email invoice otomatis terkirim ke customer
   - Order tersimpan di database dengan status pending

---

## 📋 **Status Saat Ini**

### ✅ **Sudah Berfungsi:**
- ✅ Admin panel untuk payment settings (Xendit + Gmail SMTP)
- ✅ Xendit API integration menggunakan settings dari database
- ✅ Email notification menggunakan Gmail SMTP dari database  
- ✅ Payment redirection ke Xendit checkout page
- ✅ Real-time calculation & live search kota tujuan
- ✅ Order management di admin panel

### 🔄 **Perlu Real Credentials:**
- ⚠️ **Xendit API Key**: Ganti dengan real key dari Xendit Dashboard
- ⚠️ **Gmail SMTP**: Isi dengan real Gmail credentials
- ⚠️ **Webhook URL**: Setup webhook di Xendit untuk status update

---

## 🚀 **Production Setup**

### **Environment Variables** (Optional)
Untuk security tambahan, Anda bisa menyimpan sensitive data di `.env.local`:
```bash
# Production Database
DATABASE_URL="mysql://user:pass@host:3306/floodbar_production"

# NextAuth
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-super-secret-key"

# Optional: Backup SMTP (fallback jika admin panel kosong)
GMAIL_USER="backup@gmail.com"  
GMAIL_APP_PASSWORD="backup-app-password"
```

### **Xendit Webhook Setup**
1. Di Xendit Dashboard > **Settings** > **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/xendit/webhook`
3. Enable events: `invoice.paid`, `invoice.expired`, `invoice.failed`

### **IP Whitelist** (Production)
1. Di Xendit Dashboard > **Settings** > **Developers** > **IP Allowlist**
2. Add IP server production Anda
3. Add domain: `your-production-domain.com`

---

## 🔍 **Testing & Debugging**

### **Test API Endpoints:**

```bash
# Test Payment Settings
curl -X GET http://localhost:3000/api/payment-settings

# Test Order Creation
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"payment":{"method":"xendit"},...}'

# Test Email Notification  
curl -X POST http://localhost:3000/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","orderId":"TEST-123",...}'
```

### **Cek Logs:**
- Server logs akan menunjukkan Xendit API calls
- Email logs akan menunjukkan SMTP connection status
- Payment URL akan terlihat di response order API

### **Common Issues:**

1. **Payment URL null**
   - Cek Xendit API key di admin panel
   - Cek Xendit account status (active/verified)
   - Cek IP allowlist di Xendit

2. **Email tidak terkirim**  
   - Cek Gmail App Password (16 karakter)
   - Cek 2FA enabled di Google Account
   - Cek email settings enabled di admin panel

3. **Xendit API Error**
   - Cek API key format: `xnd_development_...` atau `xnd_production_...`
   - Cek environment setting (sandbox vs production)
   - Cek Xendit dashboard untuk transaction logs

---

## 📞 **Support**

Jika ada pertanyaan atau issue:
1. Cek server logs untuk error details
2. Test individual API endpoints  
3. Verify settings di admin panel
4. Check Xendit/Gmail dashboard untuk connection status

**Sistem payment & email sudah fully functional!** 🎉
Tinggal isi real credentials di admin panel untuk production use.