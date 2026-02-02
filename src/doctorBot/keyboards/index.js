import { Markup } from 'telegraf';

export function mainMenuKeyboard() {
  return Markup.keyboard([
    ['Мои заявки'],
    ['Помощь']
  ]).resize();
}

export function applicationViewKeyboard(applicationId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Дать рекомендацию', `recommend_${applicationId}`)],
    [Markup.button.callback('Отклонить заявку', `decline_${applicationId}`)],
    [Markup.button.callback('Назад к списку', 'back_to_list')]
  ]);
}

export function confirmRecommendationKeyboard(applicationId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Отправить', `confirm_rec_${applicationId}`),
      Markup.button.callback('Редактировать', `edit_rec_${applicationId}`)
    ],
    [Markup.button.callback('Отмена', 'cancel_rec')]
  ]);
}

export function confirmDeclineKeyboard(applicationId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Подтвердить отклонение', `confirm_decline_${applicationId}`),
      Markup.button.callback('Отмена', 'cancel_decline')
    ]
  ]);
}

export function backToListKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('К списку заявок', 'back_to_list')]
  ]);
}

export function viewPhotosKeyboard(applicationId, currentIndex, totalPhotos) {
  const buttons = [];

  // Navigation row
  const navRow = [];
  if (currentIndex > 0) {
    navRow.push(Markup.button.callback('◀️ Пред.', `photo_prev_${applicationId}_${currentIndex}`));
  }
  navRow.push(Markup.button.callback(`${currentIndex + 1}/${totalPhotos}`, 'noop'));
  if (currentIndex < totalPhotos - 1) {
    navRow.push(Markup.button.callback('След. ▶️', `photo_next_${applicationId}_${currentIndex}`));
  }

  if (navRow.length > 0) {
    buttons.push(navRow);
  }

  buttons.push([Markup.button.callback('Назад к заявке', `view_app_${applicationId}`)]);

  return Markup.inlineKeyboard(buttons);
}
