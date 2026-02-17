import { Markup } from 'telegraf';
import { SKIN_TYPES, SKIN_PROBLEMS, PRICE_RANGES, CONSULTATION_GOALS, ADDITIONAL_PRODUCTS_LIST } from '../states/index.js';

export function startKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✨ Начать консультацию', 'start_questionnaire')]
  ]);
}

export function skinTypeKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(SKIN_TYPES.DRY.label, 'skin_DRY'),
      Markup.button.callback(SKIN_TYPES.OILY.label, 'skin_OILY')
    ],
    [
      Markup.button.callback(SKIN_TYPES.COMBINATION.label, 'skin_COMBINATION'),
      Markup.button.callback(SKIN_TYPES.NORMAL.label, 'skin_NORMAL')
    ],
    [
      Markup.button.callback('⬅️ Назад', 'back_to_age'),
      Markup.button.callback('Отмена', 'cancel')
    ]
  ]);
}

export function consultationGoalKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback(CONSULTATION_GOALS.FULL_CARE.label, 'goal_FULL_CARE')],
    [Markup.button.callback(CONSULTATION_GOALS.REVIEW_CARE.label, 'goal_REVIEW_CARE')],
    [Markup.button.callback(CONSULTATION_GOALS.ADDITIONAL_PRODUCTS.label, 'goal_ADDITIONAL_PRODUCTS')],
    [Markup.button.callback('⬅️ Назад', 'back_to_skin_type')]
  ]);
}

export function additionalProductsKeyboard(selected = [], productsList = ADDITIONAL_PRODUCTS_LIST) {
  const buttons = productsList.map(product => {
    const isSelected = selected.includes(product);
    const label = isSelected ? `✓ ${product}` : product;
    return [Markup.button.callback(label, `addprod_${product}`)];
  });

  const doneText = selected.length > 0
    ? `🟢 Готово (${selected.length})`
    : '🟢 Готово';
  buttons.push([Markup.button.callback(doneText, 'addprod_done')]);
  buttons.push([
    Markup.button.callback('⬅️ Назад', 'back_to_consultation_goal'),
    Markup.button.callback('Отмена', 'cancel')
  ]);

  return Markup.inlineKeyboard(buttons);
}

export function priceRangeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback(PRICE_RANGES.UP_TO_5000.label, 'price_UP_TO_5000')],
    [Markup.button.callback(PRICE_RANGES.UP_TO_10000.label, 'price_UP_TO_10000')],
    [Markup.button.callback(PRICE_RANGES.UP_TO_20000.label, 'price_UP_TO_20000')],
    [Markup.button.callback(PRICE_RANGES.OVER_20000.label, 'price_OVER_20000')],
    [
      Markup.button.callback('⬅️ Назад', 'back_to_consultation_goal'),
      Markup.button.callback('Отмена', 'cancel')
    ]
  ]);
}

export function problemsHelpKeyboard(selectedProblems = []) {
  // Filter out already selected problems
  const availableProblems = SKIN_PROBLEMS.filter(p => !selectedProblems.includes(p));

  const buttons = availableProblems.map(problem =>
    [Markup.button.callback(problem, `problem_${problem}`)]
  );

  // Show done button with count if any selected
  const doneText = selectedProblems.length > 0
    ? `🟢 Готово (${selectedProblems.length})`
    : '🟢 Готово';
  buttons.push([Markup.button.callback(doneText, 'problems_done')]);
  buttons.push([Markup.button.callback('Отмена', 'cancel')]);

  return Markup.inlineKeyboard(buttons);
}

export function problemsInputKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('💡 Помощь с выбором', 'problems_help')],
    [
      Markup.button.callback('⬅️ Назад', 'back_to_price_range'),
      Markup.button.callback('⏩ Пропустить', 'skip_problems')
    ]
  ]);
}

export function skipCommentKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⏩ Пропустить', 'skip_comment')],
    [
      Markup.button.callback('⬅️ Назад', 'back_to_problems'),
      Markup.button.callback('Отмена', 'cancel')
    ]
  ]);
}

export function photoUploadKeyboard(photoCount) {
  const buttons = [];

  if (photoCount >= 1) {
    buttons.push([Markup.button.callback(`🟢 Готово (${photoCount} фото)`, 'photos_done')]);
  }

  if (photoCount < 6) {
    buttons.push([Markup.button.callback('Добавить ещё фото', 'add_more_photos')]);
  }

  buttons.push([
    Markup.button.callback('⬅️ Назад', 'back_to_comment'),
    Markup.button.callback('Отмена', 'cancel')
  ]);

  return Markup.inlineKeyboard(buttons);
}

export function confirmKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📨 Отправить', 'confirm_submit')],
    [
      Markup.button.callback('⬅️ Назад', 'back_to_photos'),
      Markup.button.callback('Отменить', 'cancel')
    ]
  ]);
}

export function mainMenuKeyboard() {
  return Markup.keyboard([
    ['✨ Новая консультация', '🎁 Подарить'],
    ['📋 Мои заявки', '❓ Помощь']
  ]).resize();
}

export function removeKeyboard() {
  return Markup.removeKeyboard();
}
