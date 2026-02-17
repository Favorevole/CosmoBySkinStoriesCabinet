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
  return `Ты — опытный врач-косметолог. Твоя задача — дать персонализированные рекомендации по уходу за кожей на основе данных клиента.

Структура ответа:
1. Краткий анализ состояния кожи (2-3 предложения)
2. Рекомендации по ежедневному уходу (утро и вечер)
3. Рекомендуемые средства с учётом бюджета клиента
4. Дополнительные советы (при необходимости)

Правила:
- Пиши на русском языке
- Будь конкретным: указывай типы средств (например, "увлажняющий крем с гиалуроновой кислотой")
- Учитывай бюджет клиента при рекомендации средств
- Не ставь диагнозы, только рекомендации по уходу
- Используй простой и понятный язык
- Не используй Markdown-форматирование (без *, _, \` и т.д.)`;
}

function buildClientDataMessage(application) {
  let message = 'Данные клиента:\n';
  message += `- Возраст: ${application.age}\n`;
  message += `- Тип кожи: ${formatSkinType(application.skinType)}\n`;

  if (application.consultationGoal) {
    message += `- Цель консультации: ${formatConsultationGoal(application.consultationGoal)}`;
    if (application.consultationGoal === 'ADDITIONAL_PRODUCTS' && application.additionalProducts) {
      message += ` (${application.additionalProducts})`;
    }
    message += '\n';
  }

  message += `- Основные проблемы: ${application.mainProblems}\n`;

  if (application.priceRange) {
    message += `- Бюджет: ${formatPriceRange(application.priceRange)}\n`;
  }

  if (application.additionalComment) {
    message += `- Дополнительный комментарий: ${application.additionalComment}\n`;
  }

  message += '\nСоставь подробные рекомендации по уходу за кожей для этого клиента.';
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
