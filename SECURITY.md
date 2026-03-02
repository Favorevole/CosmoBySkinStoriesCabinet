# 🔒 Security Guide

## Medical Data Encryption

This application handles **sensitive medical data** (photos, consultations, personal information) and uses **AES-256-GCM encryption** to protect photos at rest in S3 storage.

---

## 🔐 Setting Up Photo Encryption

### 1. Generate Encryption Key

Generate a secure 256-bit encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string like:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 2. Add to Environment Variables

**Railway (Production):**
1. Go to your Railway project
2. Select the `backend_cabinet` service
3. Go to **Variables** tab
4. Add new variable:
   - Name: `ENCRYPTION_KEY`
   - Value: `<your generated key>`
5. Redeploy the service

**Local Development:**
Add to `.env.development`:
```bash
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 3. Verify Encryption is Active

After deployment, check the logs for:
```
🔒 Photo Encryption: ENABLED (AES-256-GCM)
```

If you see this warning, encryption is **NOT** active:
```
⚠️  Photo Encryption: DISABLED - photos stored unencrypted!
```

---

## 🛡️ How Encryption Works

### Upload Process:
1. Client uploads photo → Backend receives buffer
2. Backend encrypts with AES-256-GCM:
   - Generates random 16-byte IV (Initialization Vector)
   - Encrypts photo data
   - Creates 16-byte authentication tag (prevents tampering)
3. Saves to S3: `[MAGIC][IV][AUTH_TAG][ENCRYPTED_DATA]`
4. S3 additionally applies server-side encryption (AES256)

### Download Process:
1. Client requests photo → Backend fetches from S3
2. Backend detects encrypted format (magic bytes: `ENC1`)
3. Extracts IV and auth tag
4. Decrypts and verifies authenticity
5. Returns original photo to authorized user

### Backward Compatibility:
- Old unencrypted photos continue to work
- System automatically detects format
- New uploads are always encrypted (if key is set)

---

## 🔑 Key Management Best Practices

### ✅ DO:
- Generate a new key for each environment (dev, staging, prod)
- Store keys in secure environment variables (Railway Variables, AWS Secrets Manager)
- Keep keys in password managers (1Password, LastPass)
- Rotate keys periodically (every 6-12 months)
- Have a backup/recovery plan

### ❌ DON'T:
- Never commit keys to git (`.env` files are gitignored)
- Never share keys in Slack/email/chat
- Never reuse keys across projects
- Never store keys in code or config files

---

## 🔄 Key Rotation (Advanced)

If you need to rotate the encryption key:

1. Generate new key
2. Set as `ENCRYPTION_KEY_NEW` in environment
3. Run migration script (to be implemented):
   ```bash
   npm run migrate:reencrypt
   ```
4. After completion, swap keys:
   - `ENCRYPTION_KEY` → `ENCRYPTION_KEY_OLD` (for backward compatibility)
   - `ENCRYPTION_KEY_NEW` → `ENCRYPTION_KEY`
5. After verification period, remove old key

---

## 🚨 Security Incident Response

If encryption key is compromised:

1. **Immediate:** Rotate key immediately
2. **Audit:** Check audit logs for unauthorized access
3. **Notify:** Inform affected users if data was accessed
4. **Re-encrypt:** Re-encrypt all photos with new key
5. **Review:** Review access controls and permissions

---

## 📊 Security Features

### Currently Implemented:
- ✅ AES-256-GCM photo encryption
- ✅ bcrypt password hashing (SALT_ROUNDS: 10)
- ✅ JWT token authentication
- ✅ Rate limiting (auth: 10/15min, API: 100/15min)
- ✅ CORS restrictions
- ✅ Helmet security headers
- ✅ IP whitelist for payment webhooks
- ✅ S3 server-side encryption (additional layer)

### Planned:
- ⏳ Audit logging (who accessed what, when)
- ⏳ Two-factor authentication (2FA) for doctors
- ⏳ Content Security Policy (CSP)
- ⏳ Session management & device tracking
- ⏳ Automated security scanning
- ⏳ Data retention policies

---

## 📋 Compliance

This application handles medical data and must comply with:

### Russia:
- **152-ФЗ** - Personal data protection
- **ФЗ-323** - Medical data regulations

### International (if applicable):
- **GDPR** - EU data protection (if EU clients)
- **HIPAA** - US healthcare data (if US clients)

**Required documentation:**
- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Patient consent forms
- ✅ Data processing agreements

---

## 🔍 Security Audit Checklist

Before going to production:

- [ ] `ENCRYPTION_KEY` set in Railway
- [ ] All `.env` files in `.gitignore`
- [ ] JWT_SECRET is random and secure
- [ ] HTTPS enforced (Railway handles this)
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] Audit logging enabled
- [ ] Backup strategy in place
- [ ] Incident response plan documented
- [ ] Team trained on security practices

---

## 📞 Security Contact

For security concerns or vulnerabilities:
- **Email:** security@skinstories.ru (to be set up)
- **Response time:** 24-48 hours

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Encryption Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**Last Updated:** 2026-02-25
**Version:** 1.0.0
