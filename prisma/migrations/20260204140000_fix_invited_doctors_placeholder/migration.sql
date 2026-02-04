-- Fix invited doctors with telegramId = 0 by giving them unique negative IDs
UPDATE "doctors"
SET "telegram_id" = -("id" * 1000000 + EXTRACT(EPOCH FROM NOW())::bigint % 1000000)
WHERE "telegram_id" = 0;
