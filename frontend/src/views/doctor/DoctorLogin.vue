<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="logo-text">SKIN</span>
          <span class="logo-accent">STORIES</span>
        </div>
        <p class="subtitle">Кабинет врача</p>

        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', { active: tab === 'email' }]" @click="tab = 'email'; error = null">Email</button>
          <button :class="['tab', { active: tab === 'telegram' }]" @click="tab = 'telegram'; error = null">Telegram</button>
        </div>

        <!-- Email login -->
        <div v-if="tab === 'email'" class="step">
          <div class="field">
            <label>Email</label>
            <input type="email" v-model="email" placeholder="doctor@example.com" @keyup.enter="loginEmail">
          </div>
          <div class="field">
            <label>Пароль</label>
            <input type="password" v-model="password" placeholder="Ваш пароль" @keyup.enter="loginEmail">
          </div>
          <button @click="loginEmail" :disabled="!email || !password || loading" class="btn btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
          <router-link to="/doctor/register" class="link">Нет аккаунта? Зарегистрироваться</router-link>
        </div>

        <!-- Telegram OTP -->
        <div v-if="tab === 'telegram'" class="step">
          <div v-if="telegramStep === 1">
            <p class="instruction">Введите ваш Telegram ID</p>
            <p class="hint">Узнать ID можно у @userinfobot</p>
            <div class="field">
              <input type="text" v-model="telegramId" placeholder="Telegram ID" @keyup.enter="requestTelegramCode">
            </div>
            <button @click="requestTelegramCode" :disabled="!telegramId || loading" class="btn btn-primary">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Отправка...' : 'Получить код' }}
            </button>
          </div>
          <div v-else>
            <p class="instruction">Введите код из Telegram</p>
            <p class="hint">Мы отправили 6-значный код в ваш Telegram</p>
            <div class="field">
              <input
                type="text"
                v-model="code"
                placeholder="000000"
                maxlength="6"
                class="code-input"
                @keyup.enter="verifyTelegramCode"
              >
            </div>
            <button @click="verifyTelegramCode" :disabled="code.length !== 6 || loading" class="btn btn-primary">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Проверка...' : 'Войти' }}
            </button>
            <button @click="telegramStep = 1" class="btn btn-secondary">Назад</button>
          </div>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { doctorLogin, doctorTelegramRequestCode, doctorTelegramLogin } from '../../api/doctorCabinet.js';

const router = useRouter();

const tab = ref('email');
const email = ref('');
const password = ref('');
const telegramId = ref('');
const telegramStep = ref(1);
const code = ref('');
const loading = ref(false);
const error = ref(null);

async function loginEmail() {
  if (!email.value || !password.value) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await doctorLogin(email.value, password.value);
    localStorage.setItem('doctorToken', res.data.token);
    router.push('/doctor/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
}

async function requestTelegramCode() {
  if (!telegramId.value) return;
  loading.value = true;
  error.value = null;
  try {
    await doctorTelegramRequestCode(telegramId.value);
    telegramStep.value = 2;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка отправки кода';
  } finally {
    loading.value = false;
  }
}

async function verifyTelegramCode() {
  if (code.value.length !== 6) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await doctorTelegramLogin(telegramId.value, code.value);
    localStorage.setItem('doctorToken', res.data.token);
    router.push('/doctor/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Неверный код';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f7f4;
  padding: 20px;
}
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-card {
  background: #fff;
  padding: 48px 40px;
  border-radius: 20px;
  border: 1px solid #e8e4db;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}
.logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  font-weight: 600;
  color: #1a1a1c;
  letter-spacing: 0.3em;
}
.logo-accent {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  color: #8b7355;
  letter-spacing: 0.5em;
}
.subtitle {
  color: #999;
  font-size: 14px;
  margin-bottom: 28px;
}
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  overflow: hidden;
}
.tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #999;
  transition: all 0.2s;
}
.tab.active {
  background: #8b7355;
  color: #fff;
}
.field {
  margin-bottom: 16px;
  text-align: left;
}
.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
}
.field input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: #1a1a1c;
  background: #faf9f7;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.field input:focus {
  outline: none;
  border-color: #8b7355;
}
.code-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5em;
  background: #faf9f7;
  color: #1a1a1c;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}
.code-input:focus {
  outline: none;
  border-color: #8b7355;
}
.instruction {
  font-weight: 600;
  color: #1a1a1c;
  font-size: 16px;
  margin-bottom: 8px;
}
.hint {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}
.btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-primary {
  background: #8b7355;
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #7a6348;
}
.btn-secondary {
  background: transparent;
  color: #666;
  border: 1px solid #e8e4db;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.link {
  display: block;
  margin-top: 8px;
  color: #8b7355;
  font-size: 14px;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.error {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  font-size: 14px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
