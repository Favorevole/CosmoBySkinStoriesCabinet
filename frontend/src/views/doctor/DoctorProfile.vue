<template>
  <div class="page">
    <h1>Профиль</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <template v-else>
      <!-- Profile info -->
      <div class="card">
        <h2>Личные данные</h2>
        <div class="field">
          <label>ФИО</label>
          <input type="text" v-model="profile.fullName">
        </div>
        <div class="field">
          <label>Специализация</label>
          <input type="text" v-model="profile.specialization" placeholder="Дерматолог, косметолог">
        </div>
        <div class="field">
          <label>О себе</label>
          <textarea v-model="profile.bio" rows="4" placeholder="Расскажите о себе..."></textarea>
        </div>
        <button @click="saveProfile" :disabled="saving" class="btn btn-primary">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <div v-if="profileMsg" class="success-msg">{{ profileMsg }}</div>
      </div>

      <!-- Account links -->
      <div class="card" style="margin-top:20px;">
        <h2>Привязки</h2>
        <div class="link-row">
          <span class="link-label">Email:</span>
          <span v-if="doctor.email" class="link-value">{{ doctor.email }}</span>
          <span v-else class="link-empty">Не привязан</span>
        </div>
        <div class="link-row">
          <span class="link-label">Telegram:</span>
          <span v-if="doctor.telegramId" class="link-value">ID {{ doctor.telegramId }} {{ doctor.telegramUsername ? `(@${doctor.telegramUsername})` : '' }}</span>
          <span v-else class="link-empty">Не привязан</span>
        </div>

        <!-- Link email (if not set) -->
        <div v-if="!doctor.email" class="link-form">
          <h3>Привязать Email</h3>
          <div class="field">
            <input type="email" v-model="linkEmailData.email" placeholder="Email">
          </div>
          <div class="field">
            <input type="password" v-model="linkEmailData.password" placeholder="Пароль (мин. 6 символов)">
          </div>
          <button @click="doLinkEmail" :disabled="linking" class="btn btn-sm btn-primary">Привязать</button>
        </div>

        <!-- Link telegram (if not set) -->
        <div v-if="!doctor.telegramId" class="link-form">
          <h3>Привязать Telegram</h3>
          <div v-if="telegramStep === 1">
            <div class="field">
              <input type="text" inputmode="numeric" v-model="linkTgData.telegramId" placeholder="Ваш Telegram ID" @input="linkTgData.telegramId = linkTgData.telegramId.replace(/\D/g, '')">
            </div>
            <button @click="requestTgCode" :disabled="linking" class="btn btn-sm btn-primary">Получить код</button>
          </div>
          <div v-else>
            <div class="field">
              <input type="text" inputmode="numeric" v-model="linkTgData.code" placeholder="Код из Telegram" maxlength="6" @input="linkTgData.code = linkTgData.code.replace(/\D/g, '')">
            </div>
            <button @click="doLinkTelegram" :disabled="linking" class="btn btn-sm btn-primary">Привязать</button>
          </div>
        </div>
      </div>

      <!-- Change password -->
      <div class="card" style="margin-top:20px;">
        <h2>{{ doctor.hasPassword ? 'Сменить пароль' : 'Установить пароль' }}</h2>
        <div class="field" v-if="doctor.hasPassword">
          <label>Текущий пароль</label>
          <input type="password" v-model="pw.current">
        </div>
        <div class="field">
          <label>{{ doctor.hasPassword ? 'Новый пароль' : 'Пароль' }}</label>
          <input type="password" v-model="pw.newPw" placeholder="Мин. 6 символов">
        </div>
        <button @click="changePassword" :disabled="saving || pw.newPw.length < 6" class="btn btn-primary">
          {{ doctor.hasPassword ? 'Сменить пароль' : 'Установить пароль' }}
        </button>
        <div v-if="pwMsg" class="success-msg">{{ pwMsg }}</div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getDoctorMe, updateDoctorProfile, changeDoctorPassword,
  linkEmail, linkTelegram, linkTelegramRequestCode
} from '../../api/doctorCabinet.js';

const doctor = ref({});
const profile = ref({ fullName: '', specialization: '', bio: '' });
const loading = ref(true);
const saving = ref(false);
const linking = ref(false);
const error = ref(null);
const profileMsg = ref(null);
const pwMsg = ref(null);

const pw = ref({ current: '', newPw: '' });
const linkEmailData = ref({ email: '', password: '' });
const linkTgData = ref({ telegramId: '', code: '' });
const telegramStep = ref(1);

onMounted(async () => {
  try {
    const res = await getDoctorMe();
    doctor.value = res.data;
    profile.value = {
      fullName: res.data.fullName || '',
      specialization: res.data.specialization || '',
      bio: res.data.bio || ''
    };
  } catch (e) {
    error.value = 'Ошибка загрузки профиля';
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  saving.value = true;
  profileMsg.value = null;
  error.value = null;
  try {
    await updateDoctorProfile(profile.value);
    profileMsg.value = 'Сохранено';
    setTimeout(() => { profileMsg.value = null; }, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  saving.value = true;
  pwMsg.value = null;
  error.value = null;
  try {
    await changeDoctorPassword(pw.value.current, pw.value.newPw);
    pwMsg.value = 'Пароль изменён';
    pw.value = { current: '', newPw: '' };
    setTimeout(() => { pwMsg.value = null; }, 3000);
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    saving.value = false;
  }
}

async function doLinkEmail() {
  linking.value = true;
  error.value = null;
  try {
    await linkEmail(linkEmailData.value.email, linkEmailData.value.password);
    const res = await getDoctorMe();
    doctor.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    linking.value = false;
  }
}

async function requestTgCode() {
  linking.value = true;
  error.value = null;
  try {
    await linkTelegramRequestCode(linkTgData.value.telegramId);
    telegramStep.value = 2;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    linking.value = false;
  }
}

async function doLinkTelegram() {
  linking.value = true;
  error.value = null;
  try {
    await linkTelegram(linkTgData.value.telegramId, linkTgData.value.code);
    const res = await getDoctorMe();
    doctor.value = res.data;
    telegramStep.value = 1;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка';
  } finally {
    linking.value = false;
  }
}
</script>

<style scoped>
.page { padding: 32px; max-width: 600px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin-bottom: 24px; }
h2 { font-size: 16px; color: #1a1a1c; margin-bottom: 16px; }
h3 { font-size: 14px; color: #1a1a1c; margin: 16px 0 8px; }
.loading { text-align: center; padding: 48px; color: #999; }

.card { background: #fff; border: 1px solid #e8e4db; border-radius: 14px; padding: 24px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 500; color: #666; margin-bottom: 6px; }
.field input, .field textarea {
  width: 100%; padding: 12px 14px; border: 1px solid #e8e4db; border-radius: 8px;
  font-size: 14px; font-family: 'Inter', sans-serif; color: #1a1a1c; background: #faf9f7; box-sizing: border-box;
}
.field textarea { resize: vertical; line-height: 1.6; }
.field input:focus, .field textarea:focus { outline: none; border-color: #8b7355; }

.link-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; align-items: center; }
.link-label { color: #666; font-weight: 500; min-width: 80px; }
.link-value { color: #1a1a1c; }
.link-empty { color: #999; font-style: italic; }
.link-form { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8e4db; }

.btn {
  padding: 12px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; border: none;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-primary { background: #8b7355; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #7a6348; }
.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.success-msg { margin-top: 12px; color: #16a34a; font-size: 14px; }
.error { margin-top: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 10px; font-size: 14px; }

@media (max-width: 640px) { .page { padding: 20px 16px; } }
</style>
