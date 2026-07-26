<div align="center">

# 🧪 LabSync
### University Equipment & Lab Management System

*A modern,equipment inventory and lab checkout platform built for universities.*

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle-FFCC00?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <a href="#">🚀 Live Demo</a> •
  <a href="#">📖 Documentation</a> •
  <a href="#">🐛 Report Bug</a> •
  <a href="#">✨ Request Feature</a>
</p>

</div>

---

# 📖 Overview

University laboratories often rely on spreadsheets or paper-based systems to manage expensive equipment, resulting in:

- ❌ Lost or misplaced assets
- ❌ Double bookings
- ❌ Slow approval workflows
- ❌ Limited accountability
- ❌ Poor inventory visibility

**LabSync** solves these problems through a secure, centralized equipment management platform where students can reserve resources while administrators maintain complete oversight over inventory, approvals, scheduling, and equipment health.

---

# ✨ Features

## 📦 Equipment Inventory

- Browse equipment by category
- Real-time availability status
- Search and filter assets
- Detailed equipment information

### Supported Categories

- 📷 Cameras
- 🔍 Lenses
- 🎤 Audio Equipment
- 💡 Lighting
- 🖨️ 3D Printers
- 💻 Computing Devices

---

## 📅 Smart Booking System

Reserve equipment with confidence.

- Time-slot selection
- Pickup & return scheduling
- Conflict prevention
- Automatic availability validation
- Booking history

---

## 👥 Role-Based Access Control

Different users, different permissions.

| Role | Permissions |
|------|-------------|
| 👨‍🎓 Student | Browse equipment, create requests, report damage |
| 👨‍🏫 Faculty | Manage departmental resources, approve workflows |
| 👨‍💼 Admin | Full inventory, users, approvals |

Authentication includes:

- Google OAuth
- Email & Password
- Secure session management
- Protected routes


## ✅ Administrative Dashboard

Administrators can:

- Review pending requests
- Approve or reject bookings
- Track active loans
- Monitor overdue returns
- Detect scheduling conflicts
- Manage inventory

---

## ⚠️ Damage Reporting

Protect both borrowers and administrators through transparent condition reporting.

Features include:

- Incident reports
- Equipment condition logging
- Damage history
- Liability protection
- Maintenance tracking

---

## 🤖 Automated System Maintenance

LabSync automatically handles repetitive administrative tasks.

Examples include:

- Auto-expiring stale booking requests
- Booking status transitions
- Availability updates
- Inventory synchronization

---

# 🏗️ Technical Highlights

### ⚡ Modern Full-Stack Architecture

Built with **Next.js App Router**, utilizing **Server Actions** for secure backend-driven mutations while maintaining excellent developer experience.

---

### 🔐 Authentication & Authorization

- Better Auth
- Google OAuth
- Email/Password Login
- Role-Based Access Control (RBAC)
- Session Management

---

### 🗄️ Type-Safe Database

Powered by:

- Neon PostgreSQL
- Drizzle ORM
- Type-safe queries
- Schema migrations
- Relational modeling

---

### 🧩 Scalable Design

The project follows clean architectural principles with:

- Modular components
- Domain-driven logic
- Server-side validation
- Reusable actions
- Strong TypeScript typing

---

# 🛠 Tech Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Backend

- Server Actions
- Better Auth
- Zod Validation

## Database

- Neon PostgreSQL
- Drizzle ORM

## Forms & UI

- React Hook Form
- Zod
- Lucide React
- Sonner

---

# 📂 Project Highlights

✔ Secure authentication

✔ Server-side validation

✔ Conflict-free scheduling

✔ Automated booking lifecycle

✔ Damage reporting workflow

✔ Clean UI/UX

✔ Fully type-safe backend

---

# 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/yourusername/labsync.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Run development server
npm run dev
```

---

# 📸 Screenshots

> Add screenshots of:

- Dashboard
- Equipment Catalog
- Booking Page
- Admin Panel
- Inventory Management
- Damage Reports

---

# 🔮 Future Improvements

- Multi-tenant portal
- QR Code Equipment Checkout
- Email Notifications
- Calendar Integration
- Analytics Dashboard
- Mobile Application
- Barcode Scanner
- Equipment Maintenance Scheduler

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to fork the repository and submit a Pull Request.

---

# 📄 License

Distributed under the MIT License.

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ using **Next.js**, **Neon**, and **Drizzle ORM**

</div>