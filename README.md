# BeamShop - E-Commerce Computer Shop (มือ 1-2)

ระบบซื้อขายอุปกรณ์คอมพิวเตอร์แบบครบวงจร พัฒนาด้วย Next.js, Node.js (Express), และ MySQL

## คุณสมบัติเด่น (Features)
- 🛍️ **E-Commerce Flow Full Stack**: เลือกสินค้า, ตะกร้าสินค้า, และการชำระเงิน
- 🔐 **Authentication**: ระบบสมัครสมาชิกและล็อกอิน พร้อมสิทธิ์ Admin/User
- 🎨 **Premium UI/UX**: ดีไซน์แบบ Dark Mode ทันสมัย พร้อม Glassmorphism และ Animations
- 📦 **Admin Dashboard**: จัดการสต็อกสินค้า, ดูสถิติยอดขาย, และจัดการคำสั่งซื้อ
- 📱 **Responsive Design**: รองรับการใช้งานทั้งบนมือถือและคอมพิวเตอร์

---

## ขั้นตอนการติดตั้งและรัน (Getting Started)

### 1. ฐานข้อมูล (Database)
- เปิด **XAMPP** และรัน **MySQL Server**
- สร้างฐานข้อมูลชื่อ `beam_shop`
- นำเข้า (Import) ไฟล์ SQL: `database/schema.sql` ลงในฐานข้อมูล

### 2. ตั้งค่า Backend (Express)
1. เข้าไปที่โฟลเดอร์ `backend/`
2. ตรวจสอบไฟล์ `.env` (ตั้งค่า DB_USER, DB_PASS ให้ตรงกับ XAMPP ของคุณ)
3. รันคำสั่ง:
   ```bash
   npm install
   npm run dev
   ```
- Backend จะทำงานอยู่ที่: `http://localhost:5000`

### 3. ตั้งค่า Frontend (Next.js)
1. เข้าไปที่โฟลเดอร์ `frontend/`
2. รันคำสั่ง:
   ```bash
   npm install
   npm run dev
   ```
- Frontend จะทำงานอยู่ที่: `http://localhost:3000`

---

## บัญชีผู้ใช้ทดสอบ (Demo Accounts)

### Admin Account
- **Email:** `admin@beamshop.com` (หรือ `admin`)
- **Password:** `admin123`

### User Account
- **Email:** (สมัครสมาชิกใหม่ทางหน้าเว็บได้เลยครับ)

---

## โครงสร้างโปรเจกต์ (Project Structure)
- `backend/`: ระบบ API และการจัดการฐานข้อมูล
- `frontend/`: หน้าเว็บและ Logic การทำงานส่วนหน้า
- `database/`: ไฟล์ SQL Schema สำหรับเริ่มต้นใช้งาน

---
**BeamShop** - พัฒนาเพื่อความสะดวกในการซื้อขายอุปกรณ์คอมพิวเตอร์คุณภาพดี
