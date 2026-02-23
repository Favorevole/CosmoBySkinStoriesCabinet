export const DOCTOR_STATES = {
  IDLE: 'idle',
  AWAITING_REGISTRATION: 'awaiting_registration',
  VIEWING_APPLICATION: 'viewing_application',
  WRITING_RECOMMENDATION: 'writing_recommendation',
  CONFIRMING_DECLINE: 'confirming_decline',
  AI_DIALOG: 'ai_dialog'
};

export function createDoctorSession() {
  return {
    state: DOCTOR_STATES.IDLE,
    lastActivity: Date.now(),
    registrationData: {
      fullName: null,
      specialization: null
    },
    currentApplicationId: null,
    recommendationText: null,
    declineReason: null,
    aiHistory: [],
    aiGeneratedText: null
  };
}
