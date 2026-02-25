<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Регистрация</h1>
        <p>Создайте аккаунт для доступа к личному кабинету</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="field">
          <label>Имя *</label>
          <input
            type="text"
            v-model="fullName"
            placeholder="Ваше имя"
            required
            maxlength="200"
          >
        </div>

        <div class="field">
          <label>Email *</label>
          <input
            type="email"
            v-model="email"
            placeholder="example@mail.com"
            required
            autocomplete="email"
          >
        </div>

        <div class="field">
          <label>Пароль *</label>
          <input
            type="password"
            v-model="password"
            placeholder="Минимум 6 символов"
            required
            autocomplete="new-password"
            minlength="6"
          >
          <small class="hint">Минимум 6 символов</small>
        </div>

        <div class="field">
          <label>Подтвердите пароль *</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Повторите пароль"
            required
            autocomplete="new-password"
            minlength="6"
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Уже есть аккаунт? <router-link to="/client/login">Войти</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);
const success = ref(null);

async function handleRegister() {
  loading.value = true;
  error.value = null;
  success.value = null;

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают';
    loading.value = false;
    return;
  }

  try {
    const response = await axios.post('/api/client/auth/register', {
      fullName: fullName.value,
      email: email.value,
      password: password.value
    });

    success.value = 'Регистрация успешна! Перенаправление на вход...';

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/client/login');
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка регистрации';
    console.error('Register error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf9f7 0%, #f0e6d3 100%);
  padding: 20px;
}

.auth-container {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0 0 8px 0;
}

.auth-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
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
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #8b7355;
}

.field .hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.error-message {
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
}

.success-message {
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 14px;
}

.btn {
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #8b7355;
  color: #fff;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #7a6348;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.auth-footer a {
  color: #8b7355;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 32px 24px;
  }

  .auth-header h1 {
    font-size: 28px;
  }
}
</style>
