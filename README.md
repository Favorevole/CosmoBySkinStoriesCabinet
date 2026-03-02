# Skin Stories - Dermatology Consultation Platform

Medical consultation platform connecting patients with dermatologists through Telegram bots and web interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Telegram Bot tokens (client & doctor)
- S3-compatible storage (Selectel Cloud)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your credentials

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env.development as ENCRYPTION_KEY

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Setup

See `.env.example` for all required variables.

**Critical variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `CLIENT_BOT_TOKEN` - Telegram bot for patients
- `DOCTOR_BOT_TOKEN` - Telegram bot for doctors
- `ENCRYPTION_KEY` - 256-bit key for photo encryption (REQUIRED)
- `JWT_SECRET` - Secret for JWT tokens
- `S3_ACCESS_KEY_ID` & `S3_SECRET_ACCESS_KEY` - S3 credentials

## 🔒 Security

This application handles **sensitive medical data** and implements multiple security layers:

### Photo Encryption (AES-256-GCM)
All patient photos are encrypted at rest using AES-256-GCM encryption.

**Setup:**
1. Generate encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add to environment as `ENCRYPTION_KEY`
3. Verify in logs: `🔒 Photo Encryption: ENABLED`

**See [SECURITY.md](./SECURITY.md) for complete security documentation.**

### Security Features
- ✅ AES-256-GCM photo encryption
- ✅ bcrypt password hashing
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS restrictions
- ✅ Helmet security headers
- ✅ S3 server-side encryption

## 📦 Project Structure

```
├── src/
│   ├── server/          # Express API server
│   │   ├── routes/      # API endpoints
│   │   └── middleware/  # Auth, validation
│   ├── services/        # Business logic (S3, payment, AI)
│   ├── db/              # Prisma database layer
│   ├── clientBot/       # Patient Telegram bot
│   ├── doctorBot/       # Doctor Telegram bot
│   └── config/          # Environment configuration
├── frontend/            # Vue.js admin/doctor dashboard
├── prisma/              # Database schema & migrations
└── scripts/             # Utility scripts

```

## 🏗️ Tech Stack

**Backend:**
- Node.js 18+ (ES Modules)
- Express.js (API server)
- Prisma ORM (PostgreSQL)
- Telegraf (Telegram bots)
- AWS SDK (S3 storage)
- OpenAI API (AI recommendations)

**Frontend:**
- Vue 3 (Composition API)
- Vite (build tool)
- Vue Router
- Axios

**Infrastructure:**
- Railway (hosting)
- PostgreSQL (database)
- Selectel Cloud (S3 storage)
- YooKassa (payments)

## 🤖 Telegram Bots

### Client Bot
Patient-facing bot for:
- Submitting consultation requests
- Uploading skin photos
- Receiving doctor recommendations
- Managing appointments

### Doctor Bot
Doctor-facing bot for:
- Receiving new consultations
- Reviewing patient photos
- Sending recommendations
- Managing workload

## 🔐 Authentication

### Admin/Doctor Dashboard
- JWT-based authentication
- Telegram login (for admins)
- Email/password (for doctors)
- 2FA support (planned)

### Client Web Portal
- Email/password registration
- JWT tokens
- Session management

## 🚢 Deployment (Railway)

### Services
1. **backend_cabinet** - API server + Telegram bots
2. **SS_cabinet** - Frontend (Vite static)
3. **Postgres** - Database

### Environment Variables
Set in Railway dashboard:
- All variables from `.env.example`
- `ENCRYPTION_KEY` - **CRITICAL for production**
- `JWT_SECRET` - Random secure string
- Bot tokens, S3 credentials, payment keys

### Deploy
```bash
git push origin main  # Auto-deploys via Railway
```

## 📊 Database

Uses Prisma ORM with PostgreSQL.

### Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Schema
See `prisma/schema.prisma` for complete database schema.

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Lint
npm run lint
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
```

## 🐛 Debugging

Enable detailed logging:
```bash
DEBUG=* npm run dev
```

Check Telegram webhook status:
```
GET /health/webhooks
```

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Development:** Cosmo By Skin Stories Team
- **Security:** See [SECURITY.md](./SECURITY.md) for security contact

## 📞 Support

For issues or questions:
- Technical: Create GitHub issue
- Security: See [SECURITY.md](./SECURITY.md)
- Business: contact@skinstories.ru

---

**Version:** 2.0.0
**Last Updated:** 2026-02-25
