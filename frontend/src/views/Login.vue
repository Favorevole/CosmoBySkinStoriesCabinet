<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="logo-text">SKIN</span>
          <span class="logo-accent">STORIES</span>
        </div>
        <p class="subtitle">Панель администратора</p>

        <!-- Step 1: Enter Telegram Username or ID -->
        <div v-if="step === 1" class="step">
          <p class="instruction">Введите Telegram username или ID</p>
          <div class="input-wrapper">
            <span class="input-prefix">{{ isNumericInput ? '#' : '@' }}</span>
            <input
              type="text"
              v-model="loginInput"
              placeholder="username или ID"
              @keyup.enter="requestCode"
            >
          </div>
          <button @click="requestCode" :disabled="!loginInput || loading" class="btn btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Отправка...' : 'Получить код' }}
          </button>
        </div>

        <!-- Step 2: Enter Code -->
        <div v-if="step === 2" class="step">
          <p class="instruction">Введите код из Telegram</p>
          <p class="hint">Мы отправили 6-значный код в ваш Telegram</p>
          <div class="code-input-wrapper">
            <input
              type="text"
              v-model="code"
              placeholder="000000"
              maxlength="6"
              @keyup.enter="verifyCode"
              class="code-input"
            >
          </div>
          <button @click="verifyCode" :disabled="code.length !== 6 || loading" class="btn btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Проверка...' : 'Войти' }}
          </button>
          <button @click="step = 1" class="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Назад
          </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ error }}
        </div>
      </div>

      <p class="footer-text">
        Доступ только для авторизованных администраторов
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { requestCode as apiRequestCode, verifyCode as apiVerifyCode } from '../api/index.js';

const router = useRouter();

const step = ref(1);
const loginInput = ref('');
const telegramId = ref('');
const code = ref('');
const loading = ref(false);
const error = ref(null);

const isNumericInput = computed(() => /^\d+$/.test(loginInput.value));

async function requestCode() {
  if (!loginInput.value) return;

  loading.value = true;
  error.value = null;

  try {
    const input = loginInput.value.trim();
    let response;
    if (/^\d+$/.test(input)) {
      response = await apiRequestCode(input, null);
    } else {
      response = await apiRequestCode(null, input);
    }
    telegramId.value = response.data.telegramId;
    step.value = 2;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка отправки кода';
  } finally {
    loading.value = false;
  }
}

async function verifyCode() {
  if (code.value.length !== 6) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await apiVerifyCode(telegramId.value, code.value);
    localStorage.setItem('token', response.data.token);
    router.push('/admin');
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
  background: linear-gradient(135deg, #1A1A1C 0%, #0F0F10 100%);
  padding: 20px;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(93, 26, 45, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(201, 169, 98, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  padding: 48px 40px;
  border-radius: 20px;
  border: 1px solid rgba(201, 169, 98, 0.15);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 98, 0.05) inset;
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
  color: #FFFFFF;
  letter-spacing: 0.3em;
}

.logo-accent {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  font-weight: 400;
  color: #C9A962;
  letter-spacing: 0.5em;
}

.subtitle {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  margin-bottom: 36px;
}

.instruction {
  font-weight: 600;
  color: #FFFFFF;
  font-size: 16px;
  margin-bottom: 8px;
}

.hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #C9A962;
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.1);
}

.input-prefix {
  padding: 16px;
  padding-right: 0;
  color: #C9A962;
  font-size: 16px;
  font-weight: 500;
}

.input-wrapper input {
  flex: 1;
  padding: 16px;
  padding-left: 8px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
}

.input-wrapper input:focus {
  outline: none;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.code-input-wrapper {
  margin-bottom: 20px;
}

.code-input {
  width: 100%;
  padding: 18px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 12px;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5em;
  background: rgba(0, 0, 0, 0.3);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: #C9A962;
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.1);
}

.code-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.3em;
}

.btn {
  width: 100%;
  padding: 16px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn:last-child {
  margin-bottom: 0;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: linear-gradient(135deg, #C9A962 0%, #D4B978 100%);
  color: #1A1A1C;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(201, 169, 98, 0.3);
}

.btn-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #FFFFFF;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(26, 26, 28, 0.3);
  border-top-color: #1A1A1C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #F87171;
  padding: 14px;
  border-radius: 12px;
  margin-top: 20px;
  font-size: 14px;
}

.error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.footer-text {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}
</style>
