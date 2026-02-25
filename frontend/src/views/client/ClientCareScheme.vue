<template>
  <div class="modern-page">
    <div class="page-header">
      <h1>🧴 Схема ухода</h1>
      <p class="subtitle">Персональная программа ухода от врача</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем схему...</p>
    </div>

    <div v-else-if="!scheme" class="empty-state">
      <div class="empty-illustration">
        <div class="empty-circle">
          <span class="empty-icon">🧴</span>
        </div>
      </div>
      <h3>Схема ухода пока не создана</h3>
      <p>Врач создаст персональную схему<br>после консультации</p>
    </div>

    <div v-else>
      <div class="scheme-card">
        <div class="scheme-header">
          <span class="scheme-badge">✨ Активная схема</span>
          <div class="scheme-date">
            Создана: {{ formatDate(scheme.createdAt) }}
          </div>
        </div>
      </div>

      <CareSchemeView :scheme="scheme" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CareSchemeView from '../../components/CareSchemeView.vue';

const loading = ref(true);
const scheme = ref(null);

onMounted(loadScheme);

async function loadScheme() {
  loading.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    const response = await axios.get('/api/client/care-scheme', {
      headers: { Authorization: `Bearer ${token}` }
    });
    scheme.value = response.data.scheme;
  } catch (error) {
    console.error('Care scheme load error:', error);
    if (error.response?.status !== 404) {
      alert('Ошибка загрузки схемы ухода');
    }
  } finally {
    loading.value = false;
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

.subtitle {
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.empty-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 56px;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  color: #3a2a1f;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.empty-state p {
  font-size: 15px;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

.scheme-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.scheme-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scheme-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #6b4e3d;
  width: fit-content;
}

.scheme-date {
  font-size: 13px;
  color: #a89079;
  font-weight: 500;
}
</style>
