-- Добавление администратора в базу данных
-- Замените значения на свои перед выполнением

INSERT INTO admins (telegram_id, telegram_username, full_name, status, can_see_revenue, created_at, updated_at)
VALUES (
  123456789,           -- telegram_id: ваш Telegram ID (число)
  'your_username',     -- telegram_username: без @
  'Имя Фамилия',      -- full_name
  'ACTIVE',            -- status
  true,                -- can_see_revenue: видит ли доходы
  NOW(),
  NOW()
)
ON CONFLICT (telegram_id) DO UPDATE SET
  status = 'ACTIVE',
  full_name = EXCLUDED.full_name,
  telegram_username = EXCLUDED.telegram_username,
  updated_at = NOW();
