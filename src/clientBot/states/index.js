export const CLIENT_STATES = {
  IDLE: 'idle',
  AWAITING_AGE: 'awaiting_age',
  AWAITING_SKIN_TYPE: 'awaiting_skin_type',
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
