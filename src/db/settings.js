import prisma from './prisma.js';

// Default values (fallback if not in DB)
const DEFAULT_SKIN_PROBLEMS = [
  'Акне / прыщи',
  'Сухость и шелушение',
  'Жирный блеск',
  'Пигментация',
  'Морщины',
  'Покраснения',
  'Расширенные поры',
  'Чувствительность'
];

// Get a setting by key
export async function getSetting(key) {
  const setting = await prisma.setting.findUnique({
    where: { key }
  });
  return setting?.value || null;
}

// Set a setting
export async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

// Get all settings
export async function getAllSettings() {
  const settings = await prisma.setting.findMany();
  const result = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

// Get skin problems list
export async function getSkinProblems() {
  const problems = await getSetting('skin_problems');
  return problems || DEFAULT_SKIN_PROBLEMS;
}

// Update skin problems list
export async function updateSkinProblems(problems) {
  return setSetting('skin_problems', problems);
}
