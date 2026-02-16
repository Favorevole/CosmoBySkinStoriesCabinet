import { Markup } from 'telegraf';
import { createGiftPayment } from '../../services/payment.js';

export async function handleGift(ctx) {
  await ctx.reply(
    '*Подарочный сертификат* 🎁\n\n' +
    'Подарите близкому человеку персональную консультацию косметолога!\n\n' +
    'Как это работает:\n' +
    '1. Вы оплачиваете сертификат (500 ₽)\n' +
    '2. Получаете уникальный промокод\n' +
    '3. Передаёте код получателю\n' +
    '4. Получатель вводит код при оплате — консультация бесплатна\n\n' +
    'Код одноразовый и действует без ограничения по времени.',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Купить за 500 ₽', 'buy_gift')]
      ])
    }
  );
}

export async function handleBuyGift(ctx) {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText('Создаём ссылку на оплату...');

    const buyerTelegramId = ctx.from.id;
    const { confirmationUrl } = await createGiftPayment({ buyerTelegramId });

    await ctx.editMessageText(
      '*Подарочный сертификат* 🎁\n\n' +
      'Нажмите кнопку ниже для оплаты.\n' +
      'После оплаты вы получите промокод в этом чате.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('💳 Оплатить 500 ₽', confirmationUrl)]
        ])
      }
    );
  } catch (error) {
    console.error('[CLIENT_BOT] Error creating gift payment:', error);
    await ctx.reply('Произошла ошибка при создании платежа. Попробуйте позже.');
  }
}
