-- Add admin user K_7211
INSERT INTO "admins" ("telegram_id", "telegram_username", "full_name", "status", "created_at", "updated_at")
VALUES (6174806885, 'K_7211', 'Admin K_7211', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("telegram_id") DO UPDATE SET
  "telegram_username" = EXCLUDED."telegram_username",
  "status" = 'ACTIVE',
  "updated_at" = NOW();
