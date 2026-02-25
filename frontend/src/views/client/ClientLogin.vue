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
          <label>Пароль</label>
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

.error-message {
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
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
