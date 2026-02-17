import OpenAI from 'openai';
import config from '../config/environment.js';
import { formatSkinType, formatPriceRange, formatConsultationGoal } from '../clientBot/states/index.js';

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      return null;
    }
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openaiClient;
}

function buildSystemPrompt() {
  return `Ты — опытный врач-дерматолог и косметолог. Твоя задача — написать персональный рекомендательный скрипт по уходу за кожей лица.

Начни ответ со слов: "На основании анализа фотографий и предоставленных данных..."

Структура ответа:
1. Анализ кожи (3-5 предложений). На основе данных анкеты опиши предполагаемое состояние кожи, тип, вероятные проблемы (пигментация, акне, обезвоженность, расширенные поры и т.д.). ВАЖНО: клиенты часто ошибаются, указывая свой тип кожи и проблемы — если данные анкеты кажутся противоречивыми, отметь это мягко и дай рекомендации исходя из наиболее вероятной картины.
2. Рекомендации по ежедневному уходу:
   - Утренний уход (пошагово: очищение, тонизирование, сыворотка, крем, SPF)
   - Вечерний уход (пошагово: демакияж, очищение, активные средства, крем)
   - Дополнительный уход 1-2 раза в неделю (маски, пилинги — если нужно)
3. Рекомендуемые средства — конкретные типы продуктов с описанием активных компонентов (например, "сыворотка с ниацинамидом 10% для сужения пор"). Для каждого средства оставь место для ссылки в формате: [ССЫЛКА]. Учитывай бюджет клиента.
4. Дополнительные советы (питание, образ жизни, чего избегать — если уместно).

Правила:
- Пиши на русском языке
- Обращайся к клиенту на "вы"
- Будь конкретным и практичным — клиент должен понять, что именно покупать и как применять
- Учитывай возраст, цель консультации и бюджет
- Не ставь медицинские диагнозы, только рекомендации по уходу
- Используй простой и понятный язык, избегай сложных терминов без пояснения
- Не используй Markdown-форматирование (без *, _, \` и т.д.). Для структурирования используй нумерацию и тире`;
}

function buildClientDataMessage(application) {
  let message = 'Данные из анкеты клиента (заполнено самим клиентом, может содержать неточности):\n';
  message += `- Возраст: ${application.age}\n`;
  message += `- Тип кожи (со слов клиента): ${formatSkinType(application.skinType)}\n`;

  if (application.consultationGoal) {
    message += `- Цель консультации: ${formatConsultationGoal(application.consultationGoal)}`;
    if (application.consultationGoal === 'ADDITIONAL_PRODUCTS' && application.additionalProducts) {
      message += ` (${application.additionalProducts})`;
    }
    message += '\n';
  }

  message += `- Проблемы (со слов клиента): ${application.mainProblems}\n`;

  if (application.priceRange) {
    message += `- Бюджет на средства: ${formatPriceRange(application.priceRange)}\n`;
  }

  if (application.additionalComment) {
    message += `- Комментарий клиента: ${application.additionalComment}\n`;
  }

  message += '\nСоставь подробный рекомендательный скрипт по уходу за кожей для этого клиента. Если данные анкеты кажутся противоречивыми — отметь это и дай рекомендации исходя из наиболее вероятной картины.';
  return message;
}

export async function generateRecommendation(application) {
  const client = getClient();
  if (!client) {
    return { error: 'AI-помощник не настроен. Обратитесь к администратору.' };
  }

  try {
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildClientDataMessage(application) }
    ];

    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages,
      temperature: 0.7,
      max_tokens: 3000
    });

    const text = response.choices[0].message.content;

    return {
      text,
      history: [
        ...messages,
        { role: 'assistant', content: text }
      ],
      usage: response.usage
    };
  } catch (error) {
    console.error('[AI] Error generating recommendation:', error.message);
    return { error: `Ошибка AI: ${error.message}` };
  }
}

export async function refineRecommendation(history, instruction) {
  const client = getClient();
  if (!client) {
    return { error: 'AI-помощник не настроен.' };
  }

  try {
    const messages = [
      ...history,
      { role: 'user', content: `Доработай рекомендацию: ${instruction}` }
    ];

    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    const text = response.choices[0].message.content;

    return {
      text,
      history: [
        ...messages,
        { role: 'assistant', content: text }
      ],
      usage: response.usage
    };
  } catch (error) {
    console.error('[AI] Error refining recommendation:', error.message);
    return { error: `Ошибка AI: ${error.message}` };
  }
}
