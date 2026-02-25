<template>
  <div class="modern-page">
    <div class="page-header">
      <h1>Профиль</h1>
      <p class="page-subtitle">Управление личными данными</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем профиль...</p>
    </div>

    <div v-else class="profile-content">
      <div class="profile-card">
        <div class="card-section">
          <h3>Личная информация</h3>

          <div class="field">
            <label>Имя</label>
            <input type="text" v-model="form.fullName" placeholder="Ваше имя">
          </div>

          <div class="field">
            <label>Email</label>
            <input type="email" v-model="client.email" disabled>
            <small class="hint">Email нельзя изменить</small>
          </div>

          <div class="field">
            <label>Телефон</label>
            <input type="tel" v-model="form.phone" placeholder="+7 (900) 123-45-67">
          </div>

          <button @click="saveProfile" class="btn-save" :disabled="saving">
            <span v-if="saving">Сохранение...</span>
            <span v-else>💾 Сохранить изменения</span>
          </button>
        </div>

        <div v-if="client.createdAt" class="card-section info-section">
          <h3>Информация об аккаунте</h3>
          <div class="info-item">
            <span class="info-label">Дата регистрации:</span>
            <span class="info-value">{{ formatDate(client.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div v-if="successMsg" class="toast success">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(true);
const saving = ref(false);
const client = ref({});
const form = ref({ fullName: '', phone: '' });
const successMsg = ref(null);

onMounted(loadProfile);

async function loadProfile() {
  loading.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    const response = await axios.get('/api/client/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    client.value = response.data.client;
    form.value = {
      fullName: client.value.fullName || '',
      phone: client.value.phone || ''
    };
  } catch (error) {
    console.error('Profile load error:', error);
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  saving.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    await axios.patch('/api/client/profile', form.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    successMsg.value = '✅ Профиль успешно обновлен';
    setTimeout(() => { successMsg.value = null; }, 3000);
    await loadProfile();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения');
  } finally {
    saving.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>

<style scoped>
.modern-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #3a2a1f;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.page-subtitle {
  font-size: 15px;
  color: #a89079;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #a89079;
}

.loading-spinner {
  font-size: 56px;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading p {
  font-size: 16px;
  margin: 0;
  color: #8b7355;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.profile-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-section {
  padding: 28px;
  border-bottom: 1px solid #f5e6d3;
}

.card-section:last-child {
  border-bottom: none;
}

.card-section h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  color: #3a2a1f;
  margin: 0 0 24px 0;
  font-weight: 500;
}

.field {
  margin-bottom: 24px;
}

.field:last-of-type {
  margin-bottom: 32px;
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

.field input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #e8e4db;
}

.field input:focus:not(:disabled) {
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

.btn-save {
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.info-section {
  background: #faf9f7;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
}

.info-label {
  color: #a89079;
  font-weight: 500;
}

.info-value {
  color: #3a2a1f;
  font-weight: 600;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  color: #16a34a;
  border: 2px solid #16a34a;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .card-section {
    padding: 24px 20px;
  }
}
</style>
