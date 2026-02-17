export const CLIENT_STATES = {
  IDLE: 'idle',
  AWAITING_AGE: 'awaiting_age',
  AWAITING_SKIN_TYPE: 'awaiting_skin_type',
  AWAITING_CONSULTATION_GOAL: 'awaiting_consultation_goal',
  AWAITING_ADDITIONAL_PRODUCTS: 'awaiting_additional_products',
  AWAITING_PRICE_RANGE: 'awaiting_price_range',
  AWAITING_PROBLEMS: 'awaiting_problems',
  AWAITING_COMMENT: 'awaiting_comment',
  AWAITING_PHOTOS: 'awaiting_photos',
  AWAITING_PROMO_CODE: 'awaiting_promo_code',
  CONFIRMING: 'confirming'
};

export const SKIN_TYPES = {
  DRY: { value: 'DRY', label: 'Сухая' },
  OILY: { value: 'OILY', label: 'Жирная' },
  COMBINATION: { value: 'COMBINATION', label: 'Комбинированная' },
  NORMAL: { value: 'NORMAL', label: 'Нормальная' }
};

export const PRICE_RANGES = {
  UP_TO_5000: { value: 'UP_TO_5000', label: 'До 5 000 ₽ (до 2 средств)' },
  UP_TO_10000: { value: 'UP_TO_10000', label: 'До 10 000 ₽' },
  UP_TO_20000: { value: 'UP_TO_20000', label: 'До 20 000 ₽' },
  OVER_20000: { value: 'OVER_20000', label: 'Более 20 000 ₽' }
};

export const CONSULTATION_GOALS = {
  FULL_CARE: { value: 'FULL_CARE', label: 'Подбор ухода' },
  REVIEW_CARE: { value: 'REVIEW_CARE', label: 'Разбор текущего ухода' },
  ADDITIONAL_PRODUCTS: { value: 'ADDITIONAL_PRODUCTS', label: 'Нужны дополнительные средства' }
};

export const ADDITIONAL_PRODUCTS_LIST = [
  'Крем под глаза',
  'Сыворотка',
  'SPF',
  'Крем для шеи',
  'Тоник',
  'Маска',
  'Пилинг',
  'Масло для лица',
  'Мицеллярная вода'
];

// Function to reload additional products from database
export async function getAdditionalProductsList() {
  try {
    const { getAdditionalProducts } = await import('../../db/settings.js');
    const products = await getAdditionalProducts();
    if (Array.isArray(products) && products.length > 0) {
      return products;
    }
    return ADDITIONAL_PRODUCTS_LIST;
  } catch (error) {
    console.error('[CLIENT_BOT] Error loading additional products:', error.message);
    return ADDITIONAL_PRODUCTS_LIST;
  }
}

// Default skin problems (fallback)
export const DEFAULT_SKIN_PROBLEMS = [
  'Акне / прыщи',
  'Сухость и шелушение',
  'Жирный блеск',
  'Пигментация',
  'Морщины',
  'Покраснения',
  'Расширенные поры',
  'Чувствительность'
];

// This will be loaded from database
export let SKIN_PROBLEMS = [...DEFAULT_SKIN_PROBLEMS];

// Function to reload skin problems from database
export async function reloadSkinProblems() {
  try {
    const { getSkinProblems } = await import('../../db/settings.js');
    const problems = await getSkinProblems();
    if (Array.isArray(problems) && problems.length > 0) {
      SKIN_PROBLEMS = problems;
    }
    return SKIN_PROBLEMS;
  } catch (error) {
    console.error('[CLIENT_BOT] Error loading skin problems:', error.message);
    return DEFAULT_SKIN_PROBLEMS;
  }
}

export function createSessionData() {
  return {
    state: CLIENT_STATES.IDLE,
    applicationData: {
      age: null,
      skinType: null,
      consultationGoal: null,
      additionalProducts: null,
      priceRange: null,
      mainProblems: null,
      additionalComment: null
    },
    photos: [],
    messageIds: []
  };
}

export function formatSkinType(skinType) {
  return SKIN_TYPES[skinType]?.label || skinType;
}

export function formatPriceRange(priceRange) {
  return PRICE_RANGES[priceRange]?.label || priceRange;
}

export function formatConsultationGoal(goal) {
  return CONSULTATION_GOALS[goal]?.label || goal;
}
