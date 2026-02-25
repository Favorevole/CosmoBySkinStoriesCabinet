<template>
  <div class="page">
    <h1>Схема ухода за кожей</h1>
    <p class="subtitle">Персональная программа ухода от врача</p>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="!scheme" class="empty">
      <p>У вас пока нет схемы ухода</p>
      <p class="hint">Схема создается врачом после консультации</p>
    </div>

    <div v-else>
      <div class="scheme-header">
        <div class="scheme-date">
          Создана: {{ formatDate(scheme.createdAt) }}
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
.page {
  max-width: 1200px;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #666;
  margin: 0 0 32px 0;
}

.loading,
.empty {
  text-align: center;
  padding: 48px;
  color: #999;
}

.empty p {
  margin: 8px 0;
}

.empty .hint {
  font-size: 14px;
  color: #bbb;
}

.scheme-header {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f6f3;
  border-radius: 10px;
  border: 1px solid #e8e4db;
}

.scheme-date {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
</style>
