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
  max-width: 1000px;
}

.page-header {
  margin-bottom: 32px;
}

.back-link {
  display: inline-block;
  color: #8b7355;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 12px;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0;
}

h2 {
  font-size: 20px;
  color: #1a1a1c;
  margin: 0 0 16px 0;
}

h3 {
  font-size: 16px;
  color: #1a1a1c;
  margin: 16px 0 12px 0;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #999;
}

.consultation-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-row .label {
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

.section {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
}

.questionnaire {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quest-item {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.quest-item strong {
  color: #1a1a1c;
  font-weight: 600;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e8e4db;
  transition: border-color 0.2s;
}

.photo-item:hover {
  border-color: #8b7355;
}

.photo-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rec-date {
  font-size: 13px;
  color: #999;
}

.rec-text {
  font-size: 15px;
  color: #1a1a1c;
  line-height: 1.7;
  white-space: pre-wrap;
}

.rec-links {
  margin-top: 8px;
}

.rec-link {
  margin-top: 8px;
}

.rec-link a {
  color: #8b7355;
  text-decoration: none;
  font-size: 14px;
}

.rec-link a:hover {
  text-decoration: underline;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-COMPLETED {
  color: #16a34a;
  font-weight: 600;
}

.payment-PENDING,
.payment-FAILED {
  color: #d97706;
  font-weight: 600;
}

/* Photo modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.photo-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.photo-full {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .photo-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
