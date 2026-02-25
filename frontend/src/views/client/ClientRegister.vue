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
    console.error('Register error:', err);
    console.error('Error response:', err.response);

    if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.response?.status === 500) {
      error.value = 'Ошибка сервера. Попробуйте позже';
    } else if (err.code === 'ERR_NETWORK') {
      error.value = 'Нет соединения с сервером';
    } else {
      error.value = `Ошибка регистрации: ${err.message || 'Неизвестная ошибка'}`;
    }
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
  background: linear-gradient(180deg, #f5e6d3 0%, #faf9f7 100%);
  padding: 20px;
}

.auth-container {
  background: #fff;
  border-radius: 32px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(107, 78, 61, 0.12);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #3a2a1f;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.auth-header p {
  font-size: 15px;
  color: #a89079;
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #6b4e3d;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.field input {
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #e8d5c4;
  border-radius: 16px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: #3a2a1f;
  background: #faf9f7;
  box-sizing: border-box;
  transition: all 0.3s;
}

.field input:focus {
  outline: none;
  border-color: #8b7355;
  background: #fff;
  box-shadow: 0 4px 16px rgba(139, 115, 85, 0.1);
}

.field input::placeholder {
  color: #ccc;
}

.field .hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #a89079;
}

.error-message {
  padding: 14px 18px;
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 12px;
  color: #c33;
  font-size: 14px;
  line-height: 1.5;
}

.success-message {
  padding: 14px 18px;
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid rgba(22, 163, 74, 0.3);
  border-radius: 12px;
  color: #16a34a;
  font-size: 14px;
  line-height: 1.5;
}

.btn {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  width: 100%;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.auth-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #999;
}

.auth-footer a {
  color: #8b7355;
  text-decoration: none;
  font-weight: 700;
}

.auth-footer a:hover {
  color: #6b4e3d;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 40px 28px;
    border-radius: 28px;
  }

  .auth-header h1 {
    font-size: 32px;
  }
}
</style>
