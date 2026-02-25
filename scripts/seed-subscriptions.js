import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
dotenv.config();

import prisma from '../src/db/prisma.js';

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  // Client subscription plans
  const clientMonthly = await prisma.subscriptionPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Базовый (месяц)',
      description: 'Идеально для начала ухода за кожей',
      type: 'CLIENT_MONTHLY',
      price: 149900, // 1499 рублей в копейках
      currency: 'RUB',
      consultationsPerMonth: 2,
      features: [
        '2 консультации в месяц',
        'Персональные рекомендации',
        'Доступ к таймлайну кожи',
        'Отслеживание процедур',
        'Схемы ухода от врача'
      ],
      isActive: true
    }
  });
  console.log('✓ Created: Client Monthly Plan');

  const clientYearly = await prisma.subscriptionPlan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Премиум (год)',
      description: 'Лучшая цена для постоянного ухода',
      type: 'CLIENT_YEARLY',
      price: 1439900, // 14399 рублей в копейках (экономия ~20%)
      currency: 'RUB',
      consultationsPerMonth: 3,
      features: [
        '3 консультации в месяц',
        'Приоритетная обработка',
        'Персональные рекомендации',
        'Доступ к таймлайну кожи',
        'Отслеживание процедур',
        'Схемы ухода от врача',
        'Скидка 20% на год'
      ],
      isActive: true
    }
  });
  console.log('✓ Created: Client Yearly Plan');

  const clientUnlimited = await prisma.subscriptionPlan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Безлимит (месяц)',
      description: 'Безграничные консультации для интенсивного ухода',
      type: 'CLIENT_MONTHLY',
      price: 299900, // 2999 рублей в копейках
      currency: 'RUB',
      consultationsPerMonth: null, // Unlimited
      features: [
        'Безлимитные консультации',
        'VIP поддержка',
        'Приоритетная обработка',
        'Персональные рекомендации',
        'Доступ к таймлайну кожи',
        'Отслеживание процедур',
        'Схемы ухода от врача'
      ],
      isActive: true
    }
  });
  console.log('✓ Created: Client Unlimited Plan');

  // Doctor subscription plans
  const doctorMonthly = await prisma.subscriptionPlan.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Стартовый (месяц)',
      description: 'Для начала работы на платформе',
      type: 'DOCTOR_MONTHLY',
      price: 499900, // 4999 рублей в копейках
      currency: 'RUB',
      consultationsPerMonth: null, // No limit for doctors
      features: [
        'Доступ к платформе',
        'Работа с заявками клиентов',
        'AI-помощник для рекомендаций',
        'Шаблоны и программы ухода',
        'Алгоритмы подбора средств',
        'База продуктов с партнерскими ссылками',
        'Статистика и аналитика',
        'Уведомления о новых заявках'
      ],
      isActive: true
    }
  });
  console.log('✓ Created: Doctor Monthly Plan');

  const doctorYearly = await prisma.subscriptionPlan.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Профессиональный (год)',
      description: 'Максимальная выгода для постоянной работы',
      type: 'DOCTOR_YEARLY',
      price: 4799900, // 47999 рублей в копейках (экономия ~20%)
      currency: 'RUB',
      consultationsPerMonth: null,
      features: [
        'Все возможности стартового',
        'Приоритетная техподдержка',
        'Расширенная аналитика',
        'Доступ к новым фичам первыми',
        'Персональный менеджер',
        'Обучающие материалы',
        'Скидка 20% на год'
      ],
      isActive: true
    }
  });
  console.log('✓ Created: Doctor Yearly Plan');

  console.log('\n📊 Summary:');
  console.log('Client Plans: 3 (Monthly: 2, Yearly: 1)');
  console.log('Doctor Plans: 2 (Monthly: 1, Yearly: 1)');
  console.log('\n✅ Subscription plans seeded successfully!');
}

async function main() {
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
