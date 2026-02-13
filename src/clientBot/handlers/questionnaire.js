import {
  CLIENT_STATES,
  SKIN_PROBLEMS,
  createSessionData,
  formatSkinType,
  formatPriceRange
} from '../states/index.js';
import {
  skinTypeKeyboard,
  priceRangeKeyboard,
  problemsInputKeyboard,
  problemsHelpKeyboard,
  skipCommentKeyboard,
  confirmKeyboard,
  mainMenuKeyboard
} from '../keyboards/index.js';
import { getOrCreateClientByTelegramId } from '../../db/clients.js';
import { createApplication } from '../../db/applications.js';
import { addPhotoToApplication } from '../../db/photos.js';

// In-memory session storage
export const clientSessions = new Map();

export function getSession(telegramId) {
  if (!clientSessions.has(telegramId)) {
    clientSessions.set(telegramId, createSessionData());
  }
  return clientSessions.get(telegramId);
}

export function clearSession(telegramId) {
  clientSessions.delete(telegramId);
}

// Start questionnaire
export async function handleStartQuestionnaire(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  session.state = CLIENT_STATES.AWAITING_AGE;
  session.applicationData = {
    age: null,
    skinType: null,
    priceRange: null,
    mainProblems: null,
    additionalComment: null
  };
  session.photos = [];
  session.selectedProblems = [];

  clientSessions.set(telegramId, session);

  if (ctx.callbackQuery) await ctx.answerCbQuery();
  await ctx.reply(
    'Стоимость консультации: *500 ₽*\nОплата после заполнения анкеты.\n\n*Вопрос 1 из 5*\n\nУкажите ваш возраст (число):',
    { parse_mode: 'Markdown' }
  );
}

// Handle age input
export async function handleAgeInput(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_AGE) {
    return false;
  }

  const text = ctx.message.text.trim();
  const age = parseInt(text);

  if (isNaN(age) || age < 12 || age > 120) {
    await ctx.reply('Пожалуйста, укажите корректный возраст (число от 12 до 120).');
    return true;
  }

  session.applicationData.age = age;
  session.state = CLIENT_STATES.AWAITING_SKIN_TYPE;
  clientSessions.set(telegramId, session);

  await ctx.reply(
    '*Вопрос 2 из 5*\n\nВыберите тип вашей кожи:',
    {
      parse_mode: 'Markdown',
      ...skinTypeKeyboard()
    }
  );

  return true;
}

// Handle skin type selection
export async function handleSkinTypeSelection(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_SKIN_TYPE) {
    await ctx.answerCbQuery('Пожалуйста, начните заново с /start');
    return;
  }

  const skinType = ctx.callbackQuery.data.replace('skin_', '');
  session.applicationData.skinType = skinType;
  session.state = CLIENT_STATES.AWAITING_PRICE_RANGE;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Тип кожи: ${formatSkinType(skinType)}`
  );

  await ctx.reply(
    '*Вопрос 3 из 5*\n\nВыберите комфортный ценовой диапазон для ухода за кожей:',
    {
      parse_mode: 'Markdown',
      ...priceRangeKeyboard()
    }
  );
}

// Handle price range selection
export async function handlePriceRangeSelection(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PRICE_RANGE) {
    await ctx.answerCbQuery('Пожалуйста, начните заново с /start');
    return;
  }

  const priceRange = ctx.callbackQuery.data.replace('price_', '');
  session.applicationData.priceRange = priceRange;
  session.state = CLIENT_STATES.AWAITING_PROBLEMS;
  session.selectedProblems = [];
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `Ценовой диапазон: ${formatPriceRange(priceRange)}`
  );

  await ctx.reply(
    '*Вопрос 4 из 5*\n\nОпишите основные проблемы с кожей, которые вас беспокоят.\n\nВы можете написать своими словами или воспользоваться подсказками:',
    {
      parse_mode: 'Markdown',
      ...problemsInputKeyboard()
    }
  );
}

// Handle problems help button
export async function handleProblemsHelp(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PROBLEMS) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  await ctx.answerCbQuery();

  const selectedList = session.selectedProblems?.length > 0
    ? `✓ ${session.selectedProblems.join('\n✓ ')}`
    : '';

  await ctx.reply(
    'Выберите проблемы из списка:' +
    (selectedList ? `\n\n${selectedList}` : ''),
    problemsHelpKeyboard(session.selectedProblems || [])
  );
}

// Handle problem selection from list
export async function handleProblemSelection(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PROBLEMS) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  const problem = ctx.callbackQuery.data.replace('problem_', '');

  if (!session.selectedProblems) {
    session.selectedProblems = [];
  }

  // Only add, don't toggle (item disappears from list)
  if (!session.selectedProblems.includes(problem)) {
    session.selectedProblems.push(problem);
  }

  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery(`✓ ${problem}`);

  const selectedList = `✓ ${session.selectedProblems.join('\n✓ ')}`;

  await ctx.editMessageText(
    `Выберите проблемы из списка:\n\n${selectedList}`,
    problemsHelpKeyboard(session.selectedProblems)
  );
}

// Handle problems done
export async function handleProblemsDone(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PROBLEMS) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  if (!session.selectedProblems || session.selectedProblems.length === 0) {
    await ctx.answerCbQuery('Выберите хотя бы одну проблему или напишите текстом');
    return;
  }

  session.applicationData.mainProblems = session.selectedProblems.join(', ');
  session.state = CLIENT_STATES.AWAITING_COMMENT;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText(`Проблемы: ${session.applicationData.mainProblems}`);

  await ctx.reply(
    '*Вопрос 5 из 5*\n\nЕсть ли дополнительная информация, которую вы хотите сообщить?\n\n(текущий уход, аллергии, хронические заболевания и т.д.)',
    {
      parse_mode: 'Markdown',
      ...skipCommentKeyboard()
    }
  );
}

// Handle free text problems input
export async function handleProblemsTextInput(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PROBLEMS) {
    return false;
  }

  const text = ctx.message.text.trim();

  if (text.length < 3) {
    await ctx.reply('Пожалуйста, опишите проблемы подробнее (минимум 3 символа).');
    return true;
  }

  session.applicationData.mainProblems = text;
  session.state = CLIENT_STATES.AWAITING_COMMENT;
  clientSessions.set(telegramId, session);

  await ctx.reply(
    '*Вопрос 5 из 5*\n\nЕсть ли дополнительная информация, которую вы хотите сообщить?\n\n(текущий уход, аллергии, хронические заболевания и т.д.)',
    {
      parse_mode: 'Markdown',
      ...skipCommentKeyboard()
    }
  );

  return true;
}

// Handle skip comment
export async function handleSkipComment(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_COMMENT) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  session.applicationData.additionalComment = null;
  session.state = CLIENT_STATES.AWAITING_PHOTOS;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('Комментарий: пропущен');

  await ctx.reply(
    '*Загрузка фотографий*\n\n' +
    'Отправьте от 1 до 6 фотографий вашей кожи.\n\n' +
    'Советы:\n' +
    '- Делайте фото при хорошем освещении\n' +
    '- Снимайте проблемные участки крупным планом\n' +
    '- Без макияжа и фильтров\n\n' +
    'Отправьте первое фото:',
    { parse_mode: 'Markdown' }
  );
}

// Handle comment text input
export async function handleCommentInput(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_COMMENT) {
    return false;
  }

  const text = ctx.message.text.trim();
  session.applicationData.additionalComment = text;
  session.state = CLIENT_STATES.AWAITING_PHOTOS;
  clientSessions.set(telegramId, session);

  await ctx.reply(
    '*Загрузка фотографий*\n\n' +
    'Отправьте от 1 до 6 фотографий вашей кожи.\n\n' +
    'Советы:\n' +
    '- Делайте фото при хорошем освещении\n' +
    '- Снимайте проблемные участки крупным планом\n' +
    '- Без макияжа и фильтров\n\n' +
    'Отправьте первое фото:',
    { parse_mode: 'Markdown' }
  );

  return true;
}

// Back handlers
export async function handleBackToAge(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_AGE;
  session.applicationData.skinType = null;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('*Вопрос 1 из 5*\n\nУкажите ваш возраст (число):', { parse_mode: 'Markdown' });
}

export async function handleBackToSkinType(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_SKIN_TYPE;
  session.applicationData.priceRange = null;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('*Вопрос 2 из 5*\n\nВыберите тип вашей кожи:', {
    parse_mode: 'Markdown',
    ...skinTypeKeyboard()
  });
}

export async function handleBackToPriceRange(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_PRICE_RANGE;
  session.applicationData.mainProblems = null;
  session.selectedProblems = [];
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('*Вопрос 3 из 5*\n\nВыберите комфортный ценовой диапазон для ухода за кожей:', {
    parse_mode: 'Markdown',
    ...priceRangeKeyboard()
  });
}

export async function handleBackToProblems(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_PROBLEMS;
  session.applicationData.additionalComment = null;
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('*Вопрос 4 из 5*\n\nОпишите основные проблемы с кожей, которые вас беспокоят.\n\nВы можете написать своими словами или воспользоваться подсказками:', {
    parse_mode: 'Markdown',
    ...problemsInputKeyboard()
  });
}

export async function handleBackToComment(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_COMMENT;
  session.photos = [];
  clientSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.editMessageText('*Вопрос 5 из 5*\n\nЕсть ли дополнительная информация, которую вы хотите сообщить?\n\n(текущий уход, аллергии, хронические заболевания и т.д.)', {
    parse_mode: 'Markdown',
    ...skipCommentKeyboard()
  });
}

export async function handleBackToPhotos(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  session.state = CLIENT_STATES.AWAITING_PHOTOS;
  clientSessions.set(telegramId, session);

  const { photoUploadKeyboard } = await import('../keyboards/index.js');
  const photoCount = session.photos.length;

  await ctx.answerCbQuery();

  if (photoCount > 0) {
    await ctx.editMessageText(
      `У вас ${photoCount} фото. Отправьте ещё или нажмите "Готово".`,
      photoUploadKeyboard(photoCount)
    );
  } else {
    await ctx.editMessageText(
      '*Загрузка фотографий*\n\nОтправьте от 1 до 6 фотографий вашей кожи.',
      { parse_mode: 'Markdown' }
    );
  }
}

// Handle cancel
export async function handleCancel(ctx) {
  const telegramId = ctx.from.id;
  clearSession(telegramId);

  await ctx.answerCbQuery('Отменено');

  try {
    await ctx.editMessageText('Заявка отменена.');
  } catch (e) {
    // Message might not be editable
  }

  await ctx.reply(
    'Заявка отменена. Вы можете начать заново, нажав "Новая консультация".',
    mainMenuKeyboard()
  );
}

// Show confirmation
export async function showConfirmation(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  session.state = CLIENT_STATES.CONFIRMING;
  clientSessions.set(telegramId, session);

  const { age, skinType, priceRange, mainProblems, additionalComment } = session.applicationData;

  const summary = `
*Проверьте данные заявки:*

Возраст: ${age} лет
Тип кожи: ${formatSkinType(skinType)}
Бюджет: ${formatPriceRange(priceRange)}
Проблемы: ${mainProblems}
${additionalComment ? `Комментарий: ${additionalComment}` : 'Комментарий: нет'}
Фотографий: ${session.photos.length}

Стоимость консультации: *500 ₽*

Всё верно?
`;

  await ctx.reply(summary, {
    parse_mode: 'Markdown',
    ...confirmKeyboard()
  });
}

// Handle confirm submit
export async function handleConfirmSubmit(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.CONFIRMING) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  await ctx.answerCbQuery('Создаём заявку...');

  try {
    const { Markup } = await import('telegraf');
    const { createPayment, processPayment } = await import('../../services/payment.js');
    const username = ctx.from.username;
    const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');

    // Get or create client
    const client = await getOrCreateClientByTelegramId(telegramId, username, fullName);

    // Create application with PENDING_PAYMENT status
    const application = await createApplication({
      clientId: client.id,
      age: session.applicationData.age,
      skinType: session.applicationData.skinType,
      priceRange: session.applicationData.priceRange,
      mainProblems: session.applicationData.mainProblems,
      additionalComment: session.applicationData.additionalComment,
      source: 'TELEGRAM',
      status: 'PENDING_PAYMENT'
    });

    // Save photos
    for (let i = 0; i < session.photos.length; i++) {
      const photo = session.photos[i];
      await addPhotoToApplication(application.id, {
        fileName: `photo_${i + 1}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: photo.buffer.length,
        data: photo.buffer,
        telegramFileId: photo.fileId
      });
    }

    // Create pending payment
    await createPayment(application.id);

    // Create YooKassa payment and get URL
    const paymentResult = await processPayment(application.id);

    clearSession(telegramId);

    const appNum = application.displayNumber || application.id;
    await ctx.editMessageText(`Заявка #${appNum} создана!`);

    if (paymentResult.alreadyPaid) {
      await ctx.reply('Эта заявка уже оплачена.');
    } else {
      await ctx.reply(
        `*Заявка #${appNum} готова к оплате*\n\n` +
        'Стоимость консультации: *500 ₽*\n\n' +
        'Нажмите кнопку ниже, чтобы перейти к оплате.\n' +
        'После оплаты заявка будет отправлена специалисту.',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('Оплатить 500 ₽', paymentResult.confirmationUrl)]
          ])
        }
      );
    }

  } catch (error) {
    console.error('[CLIENT_BOT] Error submitting application:', error);
    await ctx.reply(
      'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте ещё раз или начните заново с /start'
    );
  }
}

// Handle text messages based on state
export async function handleTextMessage(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  const text = ctx.message.text;

  // Handle menu buttons
  if (text === '✨ Новая консультация' || text === 'Новая консультация') {
    session.state = CLIENT_STATES.AWAITING_AGE;
    session.applicationData = {
      age: null,
      skinType: null,
      priceRange: null,
      mainProblems: null,
      additionalComment: null
    };
    session.photos = [];
    session.selectedProblems = [];
    clientSessions.set(telegramId, session);

    await ctx.reply(
      'Стоимость консультации: *500 ₽*\nОплата после заполнения анкеты.\n\n*Вопрос 1 из 5*\n\nУкажите ваш возраст (число):',
      { parse_mode: 'Markdown' }
    );
    return true;
  }

  if (text === '📋 Мои заявки' || text === 'Мои заявки') {
    const { handleMyApplications } = await import('./start.js');
    await handleMyApplications(ctx);
    return true;
  }

  if (text === '❓ Помощь' || text === 'Помощь') {
    const { handleHelp } = await import('./start.js');
    await handleHelp(ctx);
    return true;
  }

  // Handle questionnaire states
  switch (session.state) {
    case CLIENT_STATES.AWAITING_AGE:
      return handleAgeInput(ctx);

    case CLIENT_STATES.AWAITING_PROBLEMS:
      return handleProblemsTextInput(ctx);

    case CLIENT_STATES.AWAITING_COMMENT:
      return handleCommentInput(ctx);

    case CLIENT_STATES.AWAITING_PHOTOS:
      await ctx.reply('Пожалуйста, отправьте фотографию, а не текст.');
      return true;

    default:
      return false;
  }
}
