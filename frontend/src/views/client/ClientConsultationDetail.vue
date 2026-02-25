<template>
  <div class="page">
    <div class="page-header">
      <router-link to="/client/consultations" class="back-link">← Назад</router-link>
      <h1>Консультация #{{ consultation?.displayNumber || consultation?.id }}</h1>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="consultation" class="consultation-detail">
      <!-- Status and date -->
      <div class="info-card">
        <div class="info-row">
          <span class="label">Статус:</span>
          <span :class="'status-badge status-' + consultation.status">
            {{ getStatusText(consultation.status) }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Дата создания:</span>
          <span>{{ formatDate(consultation.createdAt) }}</span>
        </div>
        <div v-if="consultation.doctor" class="info-row">
          <span class="label">Врач:</span>
          <span>{{ consultation.doctor.fullName }}</span>
        </div>
      </div>

      <!-- Questionnaire -->
      <div class="section">
        <h2>Анкета</h2>
        <div class="questionnaire">
          <div class="quest-item">
            <strong>Возраст:</strong> {{ consultation.age }} лет
          </div>
          <div class="quest-item">
            <strong>Тип кожи:</strong> {{ getSkinTypeText(consultation.skinType) }}
          </div>
          <div class="quest-item">
            <strong>Цель:</strong> {{ consultation.consultationGoal || 'Полный уход' }}
          </div>
          <div v-if="consultation.priceRange" class="quest-item">
            <strong>Бюджет:</strong> {{ getPriceRangeText(consultation.priceRange) }}
          </div>
          <div class="quest-item">
            <strong>Основные проблемы:</strong> {{ consultation.mainProblems }}
          </div>
          <div v-if="consultation.additionalComment" class="quest-item">
            <strong>Комментарий:</strong> {{ consultation.additionalComment }}
          </div>
        </div>
      </div>

      <!-- Photos -->
      <div v-if="consultation.photos && consultation.photos.length" class="section">
        <h2>Фотографии ({{ consultation.photos.length }})</h2>
        <div class="photo-gallery">
          <div
            v-for="photo in consultation.photos"
            :key="photo.id"
            class="photo-item"
            @click="openPhotoModal(photo)"
          >
            <img
              :src="`/api/web/photos/${photo.id}`"
              :alt="photo.fileName"
              class="photo-thumb"
            >
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div v-if="consultation.recommendation" class="section">
        <h2>Рекомендация врача</h2>
        <div class="recommendation">
          <div class="rec-date">
            {{ formatDate(consultation.recommendation.createdAt) }}
          </div>
          <div class="rec-text">
            {{ consultation.recommendation.text }}
          </div>
          <div v-if="consultation.recommendation.links && consultation.recommendation.links.length" class="rec-links">
            <h3>Ссылки на продукты:</h3>
            <div
              v-for="(link, i) in consultation.recommendation.links"
              :key="i"
              class="rec-link"
            >
              <a :href="link.url" target="_blank">{{ link.title }}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment -->
      <div v-if="consultation.payment" class="section">
        <h2>Оплата</h2>
        <div class="payment-info">
          <div class="info-row">
            <span class="label">Сумма:</span>
            <span>{{ consultation.payment.amount }} ₽</span>
          </div>
          <div class="info-row">
            <span class="label">Статус:</span>
            <span :class="'payment-' + consultation.payment.status">
              {{ consultation.payment.status === 'COMPLETED' ? 'Оплачено' : 'Ожидает оплаты' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo modal -->
    <div v-if="selectedPhoto" class="modal-overlay" @click="closePhotoModal">
      <div class="photo-modal" @click.stop>
        <button class="close-btn" @click="closePhotoModal">✕</button>
        <img
          :src="`/api/web/photos/${selectedPhoto.id}`"
          :alt="selectedPhoto.fileName"
          class="photo-full"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const loading = ref(true);
const consultation = ref(null);
const selectedPhoto = ref(null);

onMounted(loadConsultation);

async function loadConsultation() {
  loading.value = true;
  try {
    const id = route.params.id;
    const token = localStorage.getItem('clientToken');
    const response = await axios.get(`/api/client/consultations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    consultation.value = response.data.consultation;
  } catch (error) {
    console.error('Consultation load error:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

function getPriceRangeText(range) {
  const rangeMap = {
    'UP_TO_5000': 'До 5 000 ₽',
    'UP_TO_10000': 'До 10 000 ₽',
    'UP_TO_20000': 'До 20 000 ₽',
    'OVER_20000': 'Более 20 000 ₽'
  };
  return rangeMap[range] || range;
}

function openPhotoModal(photo) {
  selectedPhoto.value = photo;
}

function closePhotoModal() {
  selectedPhoto.value = null;
}
</script>

<style scoped>
.page {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 28px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8b7355;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #6b4e3d;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #3a2a1f;
  margin: 0;
  font-weight: 500;
}

h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  color: #3a2a1f;
  margin: 0 0 20px 0;
  font-weight: 500;
}

h3 {
  font-size: 16px;
  color: #3a2a1f;
  margin: 16px 0 12px 0;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #a89079;
}

.consultation-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
  border-bottom: 1px solid #f5e6d3;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.info-row .label {
  color: #a89079;
  font-weight: 500;
}

.status-badge {
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(232, 213, 196, 0.5);
  color: #6b4e3d;
}

.section {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.questionnaire {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quest-item {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  padding-left: 20px;
  position: relative;
}

.quest-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #8b7355;
  font-weight: bold;
}

.quest-item strong {
  color: #3a2a1f;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #f5e6d3;
  transition: all 0.3s;
}

.photo-item:hover {
  border-color: #8b7355;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rec-date {
  font-size: 12px;
  color: #a89079;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.rec-text {
  font-size: 15px;
  color: #3a2a1f;
  line-height: 1.8;
  white-space: pre-wrap;
  background: #faf9f7;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #8b7355;
}

.rec-links {
  margin-top: 12px;
  padding: 20px;
  background: #f5e6d3;
  border-radius: 12px;
}

.rec-links h3 {
  margin: 0 0 16px 0;
  color: #6b4e3d;
}

.rec-link {
  margin: 12px 0;
  padding-left: 20px;
  position: relative;
}

.rec-link::before {
  content: '🔗';
  position: absolute;
  left: 0;
}

.rec-link a {
  color: #8b7355;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
}

.rec-link a:hover {
  color: #6b4e3d;
  text-decoration: underline;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-COMPLETED {
  color: #16a34a;
  font-weight: 700;
}

.payment-PENDING,
.payment-FAILED {
  color: #d97706;
  font-weight: 700;
}

/* Photo modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.photo-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close-btn {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(90deg);
}

.photo-full {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .photo-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .section {
    padding: 20px;
  }

  .rec-text {
    padding: 16px;
  }
}
</style>
