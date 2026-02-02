import { Markup } from 'telegraf';
import { SKIN_TYPES, SKIN_PROBLEMS } from '../states/index.js';

export function startKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Начать консультацию', 'start_questionnaire')]
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
    [Markup.button.callback('Отмена', 'cancel')]
  ]);
}

export function problemsHelpKeyboard() {
  const buttons = SKIN_PROBLEMS.map(problem =>
    [Markup.button.callback(problem, `problem_${problem}`)]
  );

  buttons.push([Markup.button.callback('Готово', 'problems_done')]);
  buttons.push([Markup.button.callback('Отмена', 'cancel')]);

  return Markup.inlineKeyboard(buttons);
}

export function problemsInputKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Помощь с выбором', 'problems_help')],
    [Markup.button.callback('Отмена', 'cancel')]
  ]);
}

export function skipCommentKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Пропустить', 'skip_comment')],
    [Markup.button.callback('Отмена', 'cancel')]
  ]);
}

export function photoUploadKeyboard(photoCount) {
  const buttons = [];

  if (photoCount >= 1) {
    buttons.push([Markup.button.callback(`Готово (${photoCount} фото)`, 'photos_done')]);
  }

  if (photoCount < 6) {
    buttons.push([Markup.button.callback('Добавить ещё фото', 'add_more_photos')]);
  }

  buttons.push([Markup.button.callback('Отмена', 'cancel')]);

  return Markup.inlineKeyboard(buttons);
}

export function confirmKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Отправить', 'confirm_submit'),
      Markup.button.callback('Отменить', 'cancel')
    ]
  ]);
}

export function mainMenuKeyboard() {
  return Markup.keyboard([
    ['Новая консультация'],
    ['Мои заявки', 'Помощь']
  ]).resize();
}

export function removeKeyboard() {
  return Markup.removeKeyboard();
}
