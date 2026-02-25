<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Вход в личный кабинет</h1>
        <p>Введите свои данные для входа</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="field">
          <label>Email</label>
          <input
            type="email"
            v-model="email"
            placeholder="example@mail.com"
            required
            autocomplete="email"
          >
        </div>

        <div class="field">
          <div class="field-header">
            <label>Пароль</label>
            <a href="/client/forgot-password" class="forgot-link">Забыли пароль?</a>
          </div>
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
            minlength="6"
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Нет аккаунта? <router-link to="/client/register">Зарегистрироваться</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

async function handleLogin() {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.post('/api/client/auth/login', {
      email: email.value,
      password: password.value
    });

    // Save token
    localStorage.setItem('clientToken', response.data.token);

    // Redirect to dashboard
    router.push('/client/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка входа';
    console.error('Login error:', err);
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
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #6b4e3d;
  margin: 0;
  letter-spacing: 0.3px;
}

.forgot-link {
  font-size: 12px;
  color: #8b7355;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  color: #6b4e3d;
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

.error-message {
  padding: 14px 18px;
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 12px;
  color: #c33;
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
