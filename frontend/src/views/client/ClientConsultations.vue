<template>
  <div class="page">
    <h1>Мои консультации</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="consultations.length === 0" class="empty">
      <p>У вас пока нет консультаций</p>
      <a href="/" class="btn btn-primary">Заказать консультацию</a>
    </div>
    <div v-else class="consultations-list">
      <div
        v-for="consultation in consultations"
        :key="consultation.id"
        class="consultation-card"
      >
        <div class="card-header">
          <div class="card-date">
            📅 {{ formatDate(consultation.createdAt) }}
          </div>
          <span :class="'status-badge status-' + consultation.status">
            {{ getStatusText(consultation.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="card-info">
            <div class="info-item">
              <strong>Тип кожи:</strong> {{ getSkinTypeText(consultation.skinType) }}
            </div>
            <div class="info-item">
              <strong>Цель:</strong> {{ consultation.consultationGoal || 'Полный уход' }}
            </div>
            <div v-if="consultation.doctor" class="info-item">
              <strong>Врач:</strong> {{ consultation.doctor.fullName }}
            </div>
          </div>

          <div v-if="consultation.photos && consultation.photos.length" class="card-photos">
            <small>📷 Фото: {{ consultation.photos.length }}</small>
          </div>

          <div v-if="consultation.recommendation" class="card-recommendation">
            ✅ Рекомендация получена
          </div>
        </div>

        <div class="card-footer">
          <router-link
            :to="`/client/consultations/${consultation.id}`"
            class="btn-link"
          >
            Подробнее →
          </router-link>
        </div>
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
    'PENDING_PAYMENT': 'Ожидает оплаты',
    'NEW': 'Новая',
    'ASSIGNED': 'Назначена врачу',
    'RESPONSE_GIVEN': 'Ответ готов',
    'APPROVED': 'Одобрено',
    'SENT_TO_CLIENT': 'Отправлено',
    'DECLINED': 'Отклонено',
    'CANCELLED': 'Отменено'
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
.page {
  max-width: 1000px;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0 0 32px 0;
}

.loading,
.empty {
  text-align: center;
  padding: 48px;
  color: #999;
}

.empty p {
  margin-bottom: 20px;
  font-size: 16px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  background: #8b7355;
  color: #fff;
}

.btn-primary:hover {
  background: #7a6348;
}

.consultations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consultation-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e4db;
}

.card-date {
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-SENT_TO_CLIENT,
.status-APPROVED {
  background: #dcfce7;
  color: #16a34a;
}

.status-NEW,
.status-ASSIGNED,
.status-RESPONSE_GIVEN {
  background: #fef3c7;
  color: #d97706;
}

.status-PENDING_PAYMENT {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-DECLINED,
.status-CANCELLED {
  background: #fee;
  color: #c33;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 14px;
  color: #666;
}

.info-item strong {
  color: #1a1a1c;
  font-weight: 600;
}

.card-photos,
.card-recommendation {
  font-size: 13px;
  color: #666;
}

.card-recommendation {
  color: #16a34a;
  font-weight: 600;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e4db;
}

.btn-link {
  color: #8b7355;
  font-weight: 600;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
