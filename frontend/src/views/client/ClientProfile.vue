<template>
  <div class="page">
    <h1>Профиль</h1>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="profile-content">
      <div class="profile-section">
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
        <button @click="saveProfile" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>

      <div v-if="successMsg" class="toast">{{ successMsg }}</div>
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
    successMsg.value = 'Профиль обновлен';
    setTimeout(() => { successMsg.value = null; }, 3000);
    await loadProfile();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.page {
  max-width: 600px;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0 0 32px 0;
}

h3 {
  font-size: 18px;
  color: #1a1a1c;
  margin: 0 0 20px 0;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #999;
}

.profile-section {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
}

.field {
  margin-bottom: 20px;
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
  padding: 12px 14px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1a1a1c;
  background: #faf9f7;
  box-sizing: border-box;
}

.field input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.field input:focus:not(:disabled) {
  outline: none;
  border-color: #8b7355;
}

.field .hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.btn {
  padding: 12px 24px;
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
}

.btn-primary:hover:not(:disabled) {
  background: #7a6348;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  border-radius: 10px;
  font-size: 14px;
}
</style>
