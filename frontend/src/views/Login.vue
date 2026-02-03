<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Вход в админ-панель</h1>
      <p class="subtitle">CosmoSkin Consultation System</p>

      <!-- Step 1: Enter Telegram Username -->
      <div v-if="step === 1" class="step">
        <p class="instruction">Введите ваш Telegram username</p>
        <p class="hint">
          Введите ваш username без @, например: username
        </p>
        <input
          type="text"
          v-model="telegramUsername"
          placeholder="Например: username"
          @keyup.enter="requestCode"
        >
        <button @click="requestCode" :disabled="!telegramUsername || loading" class="btn btn-primary">
          {{ loading ? 'Отправка...' : 'Получить код' }}
        </button>
      </div>

      <!-- Step 2: Enter Code -->
      <div v-if="step === 2" class="step">
        <p class="instruction">Введите код из Telegram</p>
        <p class="hint">Мы отправили 6-значный код в ваш Telegram</p>
        <input
          type="text"
          v-model="code"
          placeholder="Код из Telegram"
          maxlength="6"
          @keyup.enter="verifyCode"
        >
        <button @click="verifyCode" :disabled="code.length !== 6 || loading" class="btn btn-primary">
          {{ loading ? 'Проверка...' : 'Войти' }}
        </button>
        <button @click="step = 1" class="btn btn-secondary">Назад</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requestCode as apiRequestCode, verifyCode as apiVerifyCode } from '../api/index.js';

const router = useRouter();

const step = ref(1);
const telegramUsername = ref('');
const telegramId = ref('');
const code = ref('');
const loading = ref(false);
const error = ref(null);

async function requestCode() {
  if (!telegramUsername.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await apiRequestCode(null, telegramUsername.value);
    // Save the telegramId returned by server for verification step
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
  background: linear-gradient(135deg, var(--secondary) 0%, white 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--gray-500);
  margin-bottom: 30px;
}

.instruction {
  font-weight: 600;
  margin-bottom: 8px;
}

.hint {
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  text-align: center;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #FEE2E2;
  color: var(--danger);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}
</style>
