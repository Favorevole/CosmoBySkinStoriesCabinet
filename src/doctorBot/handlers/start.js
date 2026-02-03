import { DOCTOR_STATES, createDoctorSession } from '../states/index.js';
import { mainMenuKeyboard } from '../keyboards/index.js';
import { getDoctorByTelegramId, getDoctorByUsername, createDoctor, linkDoctorTelegramId } from '../../db/doctors.js';

// In-memory session storage
export const doctorSessions = new Map();

export function getSession(telegramId) {
  if (!doctorSessions.has(telegramId)) {
    doctorSessions.set(telegramId, createDoctorSession());
  }
  return doctorSessions.get(telegramId);
}

export function clearSession(telegramId) {
  doctorSessions.delete(telegramId);
}

export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;

  try {
    // First check if doctor already registered by telegram ID
    let doctor = await getDoctorByTelegramId(telegramId);

    // If not found by ID, check if pre-registered by username
    if (!doctor && username) {
      const preRegistered = await getDoctorByUsername(username);
      if (preRegistered && preRegistered.telegramId.toString() === '0') {
        // Link telegram ID to pre-registered doctor
        doctor = await linkDoctorTelegramId(preRegistered.id, telegramId);

        await ctx.reply(
          `Добро пожаловать, ${doctor.fullName}!\n\n` +
          'Ваш аккаунт врача активирован.\n' +
          'Теперь вы можете получать заявки на консультации.',
          mainMenuKeyboard()
        );
        return;
      }
    }

    if (doctor) {
      if (doctor.status === 'ACTIVE') {
        await ctx.reply(
          `Добро пожаловать, ${doctor.fullName}!\n\n` +
          'Вы можете просматривать назначенные заявки и давать рекомендации.',
          mainMenuKeyboard()
        );
      } else if (doctor.status === 'PENDING') {
        await ctx.reply(
          'Ваша заявка на регистрацию врача на рассмотрении.\n\n' +
          'Администратор свяжется с вами после проверки.'
        );
      } else {
        await ctx.reply('Ваш аккаунт заблокирован. Свяжитесь с администратором.');
      }
      return;
    }

    // New doctor - start registration
    const session = getSession(telegramId);
    session.state = DOCTOR_STATES.AWAITING_REGISTRATION;
    doctorSessions.set(telegramId, session);

    await ctx.reply(
      'Добро пожаловать в систему консультаций!\n\n' +
      'Для регистрации как врач, пожалуйста, укажите ваше ФИО:'
    );

  } catch (error) {
    console.error('[DOCTOR_BOT] Error in /start:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleRegistration(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== DOCTOR_STATES.AWAITING_REGISTRATION) {
    return false;
  }

  const fullName = ctx.message.text.trim();

  if (fullName.length < 3) {
    await ctx.reply('Пожалуйста, укажите полное ФИО (минимум 3 символа).');
    return true;
  }

  try {
    const username = ctx.from.username;

    await createDoctor({
      telegramId,
      telegramUsername: username,
      fullName
    });

    clearSession(telegramId);

    await ctx.reply(
      `Спасибо, ${fullName}!\n\n` +
      'Ваша заявка на регистрацию отправлена.\n\n' +
      'Администратор проверит данные и активирует ваш аккаунт. ' +
      'Вы получите уведомление, когда сможете принимать заявки.'
    );

    // Notify admins about new doctor
    const { notifyAdminsNewDoctor } = await import('./applications.js');
    await notifyAdminsNewDoctor({ fullName, telegramId, telegramUsername: username });

    return true;
  } catch (error) {
    console.error('[DOCTOR_BOT] Error registering doctor:', error);
    await ctx.reply('Произошла ошибка при регистрации. Попробуйте позже.');
    return true;
  }
}

export async function handleHelp(ctx) {
  const helpMessage = `
*Помощь для врачей*

Команды:
/start - начать работу
/help - показать справку

Как работать:
1. Администратор назначает вам заявки
2. Вы получаете уведомление с информацией
3. Просматриваете анкету и фотографии
4. Пишете рекомендации
5. Администратор проверяет и отправляет клиенту

Кнопка "Мои заявки" показывает все назначенные заявки.
`;

  await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
}
