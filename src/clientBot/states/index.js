export const CLIENT_STATES = {
  IDLE: 'idle',
  AWAITING_AGE: 'awaiting_age',
  AWAITING_SKIN_TYPE: 'awaiting_skin_type',
  AWAITING_PRICE_RANGE: 'awaiting_price_range',
  AWAITING_PROBLEMS: 'awaiting_problems',
  AWAITING_COMMENT: 'awaiting_comment',
  AWAITING_PHOTOS: 'awaiting_photos',
  CONFIRMING: 'confirming'
};

export const SKIN_TYPES = {
  DRY: { value: 'DRY', label: 'Сухая' },
  OILY: { value: 'OILY', label: 'Жирная' },
  COMBINATION: { value: 'COMBINATION', label: 'Комбинированная' },
  NORMAL: { value: 'NORMAL', label: 'Нормальная' }
};

export const PRICE_RANGES = {
  UP_TO_5000: { value: 'UP_TO_5000', label: 'До 5 000 ₽' },
  UP_TO_10000: { value: 'UP_TO_10000', label: 'До 10 000 ₽' },
  UP_TO_20000: { value: 'UP_TO_20000', label: 'До 20 000 ₽' }
};

export const SKIN_PROBLEMS = [
  'Акне / прыщи',
  'Сухость и шелушение',
  'Жирный блеск',
  'Пигментация',
  'Морщины',
  'Покраснения',
  'Расширенные поры',
  'Чувствительность'
];

export function createSessionData() {
  return {
    state: CLIENT_STATES.IDLE,
    applicationData: {
      age: null,
      skinType: null,
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
