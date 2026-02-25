-- Seed subscription plans for SKIN STORIES platform
-- Run this script in your PostgreSQL database

-- Delete existing plans if needed (optional - remove these lines if you want to keep existing data)
-- DELETE FROM subscriptions WHERE plan_id IN (1, 2, 3, 4, 5);
-- DELETE FROM subscription_plans WHERE id IN (1, 2, 3, 4, 5);

-- Client Subscription Plans

-- 1. Базовый (месяц) - Client Monthly
INSERT INTO subscription_plans (id, name, description, type, price, currency, consultations_per_month, features, is_active, created_at, updated_at)
VALUES (
  1,
  'Базовый (месяц)',
  'Идеально для начала ухода за кожей',
  'CLIENT_MONTHLY',
  149900, -- 1499 рублей
  'RUB',
  2, -- 2 консультации в месяц
  '["2 консультации в месяц", "Персональные рекомендации", "Доступ к таймлайну кожи", "Отслеживание процедур", "Схемы ухода от врача"]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 2. Премиум (год) - Client Yearly
INSERT INTO subscription_plans (id, name, description, type, price, currency, consultations_per_month, features, is_active, created_at, updated_at)
VALUES (
  2,
  'Премиум (год)',
  'Лучшая цена для постоянного ухода',
  'CLIENT_YEARLY',
  1439900, -- 14399 рублей (экономия ~20%)
  'RUB',
  3, -- 3 консультации в месяц
  '["3 консультации в месяц", "Приоритетная обработка", "Персональные рекомендации", "Доступ к таймлайну кожи", "Отслеживание процедур", "Схемы ухода от врача", "Скидка 20% на год"]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 3. Безлимит (месяц) - Client Unlimited
INSERT INTO subscription_plans (id, name, description, type, price, currency, consultations_per_month, features, is_active, created_at, updated_at)
VALUES (
  3,
  'Безлимит (месяц)',
  'Безграничные консультации для интенсивного ухода',
  'CLIENT_MONTHLY',
  299900, -- 2999 рублей
  'RUB',
  NULL, -- Безлимит
  '["Безлимитные консультации", "VIP поддержка", "Приоритетная обработка", "Персональные рекомендации", "Доступ к таймлайну кожи", "Отслеживание процедур", "Схемы ухода от врача"]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Doctor Subscription Plans

-- 4. Стартовый (месяц) - Doctor Monthly
INSERT INTO subscription_plans (id, name, description, type, price, currency, consultations_per_month, features, is_active, created_at, updated_at)
VALUES (
  4,
  'Стартовый (месяц)',
  'Для начала работы на платформе',
  'DOCTOR_MONTHLY',
  499900, -- 4999 рублей
  'RUB',
  NULL, -- No limit for doctors
  '["Доступ к платформе", "Работа с заявками клиентов", "AI-помощник для рекомендаций", "Шаблоны и программы ухода", "Алгоритмы подбора средств", "База продуктов с партнерскими ссылками", "Статистика и аналитика", "Уведомления о новых заявках"]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 5. Профессиональный (год) - Doctor Yearly
INSERT INTO subscription_plans (id, name, description, type, price, currency, consultations_per_month, features, is_active, created_at, updated_at)
VALUES (
  5,
  'Профессиональный (год)',
  'Максимальная выгода для постоянной работы',
  'DOCTOR_YEARLY',
  4799900, -- 47999 рублей (экономия ~20%)
  'RUB',
  NULL,
  '["Все возможности стартового", "Приоритетная техподдержка", "Расширенная аналитика", "Доступ к новым фичам первыми", "Персональный менеджер", "Обучающие материалы", "Скидка 20% на год"]'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Reset sequence to continue from 6
SELECT setval('subscription_plans_id_seq', 5, true);

-- Summary
SELECT
  id,
  name,
  type,
  CONCAT(price / 100, ' ₽') as price,
  consultations_per_month,
  is_active
FROM subscription_plans
ORDER BY id;
