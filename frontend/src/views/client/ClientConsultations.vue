<template>
  <div class="modern-page">
    <div class="page-header">
      <h1>Консультации</h1>
      <p class="page-subtitle">История ваших обращений</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем консультации...</p>
    </div>

    <div v-else-if="consultations.length === 0" class="empty-state">
      <div class="empty-illustration">
        <div class="empty-circle">
          <span class="empty-icon">💬</span>
        </div>
      </div>
      <h3>Начните свою историю</h3>
      <p>Получите персональные рекомендации<br>от косметолога</p>
      <a href="/" class="cta-button">
        <span class="cta-icon">✨</span>
        <span>Новая консультация</span>
      </a>
    </div>

    <div v-else class="consultations-grid">
      <div
        v-for="consultation in consultations"
        :key="consultation.id"
        class="consultation-card"
      >
        <div class="card-top">
          <div class="card-date">{{ formatDate(consultation.createdAt) }}</div>
          <div class="card-status">
            {{ getStatusText(consultation.status) }}
          </div>
        </div>

        <div class="card-details">
          <div class="detail-row">
            <span class="detail-icon">🧪</span>
            <span class="detail-text">{{ getSkinTypeText(consultation.skinType) }}</span>
          </div>

          <div v-if="consultation.doctor" class="detail-row">
            <span class="detail-icon">👨‍⚕️</span>
            <span class="detail-text">{{ consultation.doctor.fullName }}</span>
          </div>

          <div v-if="consultation.photos && consultation.photos.length" class="detail-row">
            <span class="detail-icon">📷</span>
            <span class="detail-text">{{ consultation.photos.length }} фото</span>
          </div>
        </div>

        <router-link
          :to="`/client/consultations/${consultation.id}`"
          class="card-action"
        >
          Подробнее
          <span class="arrow">→</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(true);
const consultations = ref([]);

onMounted(loadConsultations);

async function loadConsultations() {
  loading.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    const response = await axios.get('/api/client/consultations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    consultations.value = response.data.consultations;
  } catch (error) {
    console.error('Consultations load error:', error);
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

function getStatusText(status) {
  const statusMap = {
    'PENDING_PAYMENT': '💳 Ожидает оплаты',
    'NEW': '🆕 Заявка получена',
    'ASSIGNED': '👨‍⚕️ Врач изучает',
    'RESPONSE_GIVEN': '✅ Рекомендации готовы',
    'APPROVED': '✅ Одобрено',
    'SENT_TO_CLIENT': '📨 Отправлено',
    'DECLINED': '❌ Отклонено',
    'CANCELLED': '❌ Отменено'
  };
  return statusMap[status] || status;
}

function getSkinTypeText(skinType) {
  const skinTypeMap = {
    'DRY': 'Сухая',
    'OILY': 'Жирная',
    'COMBINATION': 'Комбинированная',
    'NORMAL': 'Нормальная'
  };
  return skinTypeMap[skinType] || skinType;
}
</script>

<style scoped>
/* Modern Page Layout */
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

/* Loading State */
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

/* Empty State */
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
  margin: 0 0 32px 0;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.cta-icon {
  font-size: 20px;
}

/* Consultations Grid */
.consultations-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.consultation-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.consultation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5e6d3;
}

.card-date {
  font-size: 13px;
  color: #a89079;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.card-status {
  font-size: 12px;
  padding: 6px 12px;
  background: rgba(232, 213, 196, 0.5);
  border-radius: 100px;
  color: #6b4e3d;
  font-weight: 600;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.detail-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.detail-text {
  color: #3a2a1f;
  font-weight: 500;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #8b7355;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  padding: 10px 0;
  transition: all 0.2s;
}

.card-action:hover {
  color: #6b4e3d;
}

.card-action:hover .arrow {
  transform: translateX(4px);
}

.arrow {
  transition: transform 0.2s;
  display: inline-block;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 32px;
  }

  .consultation-card {
    padding: 20px;
  }

  .card-top {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
