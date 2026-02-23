<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="logo-text">SKIN</span>
          <span class="logo-accent">STORIES</span>
        </div>
        <p class="subtitle">Регистрация врача</p>

        <div v-if="!registered" class="step">
          <div class="field">
            <label>ФИО *</label>
            <input type="text" v-model="fullName" placeholder="Иванова Мария Петровна" @keyup.enter="register">
          </div>
          <div class="field">
            <label>Email *</label>
            <input type="email" v-model="email" placeholder="doctor@example.com" @keyup.enter="register">
          </div>
          <div class="field">
            <label>Пароль *</label>
            <input type="password" v-model="password" placeholder="Минимум 6 символов" @keyup.enter="register">
          </div>
          <div class="field">
            <label>Специализация</label>
            <input type="text" v-model="specialization" placeholder="Дерматолог, косметолог" @keyup.enter="register">
          </div>
          <button @click="register" :disabled="!canSubmit || loading" class="btn btn-primary">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
          <router-link to="/doctor/login" class="link">Уже есть аккаунт? Войти</router-link>
        </div>

        <div v-else class="success">
          <div class="success-icon">&#10003;</div>
          <h3>Регистрация успешна</h3>
          <p>Ваша заявка отправлена на рассмотрение. Администратор одобрит вашу учётную запись, после чего вы сможете войти.</p>
          <router-link to="/doctor/login" class="btn btn-primary" style="text-decoration:none; display:flex;">Перейти к входу</router-link>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { doctorRegister } from '../../api/doctorCabinet.js';

const fullName = ref('');
const email = ref('');
const password = ref('');
const specialization = ref('');
const loading = ref(false);
const error = ref(null);
const registered = ref(false);

const canSubmit = computed(() =>
  fullName.value.trim() && email.value.trim() && password.value.length >= 6
);

async function register() {
  if (!canSubmit.value) return;
  loading.value = true;
  error.value = null;
  try {
    await doctorRegister({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      specialization: specialization.value.trim() || undefined
    });
    registered.value = true;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка регистрации';
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
  max-width: 420px;
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
  box-sizing: border-box;
}
.field input:focus {
  outline: none;
  border-color: #8b7355;
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
.success {
  padding: 20px 0;
}
.success-icon {
  width: 60px;
  height: 60px;
  background: #d4edda;
  color: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}
.success h3 {
  color: #1a1a1c;
  margin-bottom: 12px;
}
.success p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
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
