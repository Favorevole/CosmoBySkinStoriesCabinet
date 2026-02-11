<template>
  <div class="detail-page" v-if="application">
    <header class="page-header">
      <button @click="$router.back()" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Назад
      </button>
      <h1>Заявка #{{ application.displayNumber || application.id }}</h1>
      <span :class="['status', `status-${application.status.toLowerCase()}`]">
        {{ statusLabels[application.status] }}
      </span>
    </header>

    <div class="content-grid">
      <!-- Left: Questionnaire -->
      <div class="section questionnaire">
        <div class="section-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h2>Анкета</h2>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Возраст</span>
            <span class="value">{{ application.age }} лет</span>
          </div>
          <div class="info-item">
            <span class="label">Тип кожи</span>
            <span class="value">{{ skinTypeLabels[application.skinType] }}</span>
          </div>
          <div class="info-item full">
            <span class="label">Основные проблемы</span>
            <span class="value">{{ application.mainProblems }}</span>
          </div>
          <div class="info-item full" v-if="application.additionalComment">
            <span class="label">Дополнительный комментарий</span>
            <span class="value">{{ application.additionalComment }}</span>
          </div>
        </div>

        <div class="photos-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Фотографии ({{ application.photos.length }})
          </h3>
          <div class="photos-grid">
            <div
              v-for="photo in application.photos"
              :key="photo.id"
              class="photo-thumb"
              @click="openPhoto(photo)"
            >
              <img :src="getPhotoUrl(application.id, photo.id)" alt="">
              <div class="photo-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="section actions">
        <!-- Client Info -->
        <div class="subsection">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Клиент
          </h3>
          <div class="client-info">
            <div class="client-avatar">
              {{ (application.client?.fullName || 'U').substring(0, 2).toUpperCase() }}
            </div>
            <div class="client-details">
              <p class="client-name">{{ application.client?.fullName || 'Не указано' }}</p>
              <p class="client-contact" v-if="application.client?.telegramUsername">
                @{{ application.client.telegramUsername }}
              </p>
              <p class="client-contact" v-if="application.client?.email">
                {{ application.client.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Assign Doctor (if NEW) -->
        <div class="subsection" v-if="application.status === 'NEW'">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Назначить врача
          </h3>
          <select v-model="selectedDoctorId" class="select-doctor">
            <option value="">Выберите врача</option>
            <option v-for="doc in availableDoctors" :key="doc.id" :value="doc.id">
              {{ doc.fullName }}
            </option>
          </select>
          <button
            @click="assignDoctor"
            :disabled="!selectedDoctorId || assigning"
            class="btn btn-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ assigning ? 'Назначение...' : 'Назначить врача' }}
          </button>
        </div>

        <!-- Doctor Info (if assigned) -->
        <div class="subsection" v-if="application.doctor">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
            Назначенный врач
          </h3>
          <div class="doctor-badge">
            <div class="doctor-avatar">
              {{ application.doctor.fullName.substring(0, 2).toUpperCase() }}
            </div>
            <span>{{ application.doctor.fullName }}</span>
          </div>
        </div>

        <!-- Recommendation (if exists) -->
        <div class="subsection recommendation-section" v-if="application.recommendation">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Рекомендации врача
          </h3>
          <div class="recommendation-box">
            <textarea
              v-model="editedRecommendation"
              rows="10"
              :disabled="application.status === 'SENT_TO_CLIENT'"
              placeholder="Рекомендации..."
            ></textarea>
            <div class="rec-actions" v-if="application.status === 'RESPONSE_GIVEN'">
              <button @click="saveRecommendation" :disabled="saving" class="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
              <button @click="approveAndSend" :disabled="approving" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                {{ approving ? 'Отправка...' : 'Одобрить и отправить' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Status History -->
        <div class="subsection">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            История
          </h3>
          <div class="history-list">
            <div v-for="item in application.statusHistory" :key="item.id" class="history-item">
              <div class="history-dot"></div>
              <div class="history-content">
                <span class="history-status">{{ statusLabels[item.toStatus] }}</span>
                <span class="history-date">{{ formatDate(item.createdAt) }}</span>
                <span class="history-comment" v-if="item.comment">{{ item.comment }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <div
      class="modal"
      v-if="selectedPhoto"
      @click="selectedPhoto = null"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <button class="modal-close" @click.stop="selectedPhoto = null">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <button
        v-if="currentPhotoIndex > 0"
        class="modal-nav modal-prev"
        @click.stop="prevPhoto"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <img
        :src="getPhotoUrl(application.id, selectedPhoto.id)"
        alt=""
        @click.stop
      >

      <button
        v-if="currentPhotoIndex < application.photos.length - 1"
        class="modal-nav modal-next"
        @click.stop="nextPhoto"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div class="modal-counter" @click.stop>
        {{ currentPhotoIndex + 1 }} / {{ application.photos.length }}
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <div class="loading-spinner"></div>
    <span>Загрузка...</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  getApplication,
  getAvailableDoctors,
  assignDoctor as apiAssignDoctor,
  updateRecommendation,
  approveApplication,
  getPhotoUrl
} from '../api/index.js';

const route = useRoute();

const application = ref(null);
const availableDoctors = ref([]);
const selectedDoctorId = ref('');
const selectedPhoto = ref(null);
const editedRecommendation = ref('');
const assigning = ref(false);
const saving = ref(false);
const approving = ref(false);

// Photo navigation
const currentPhotoIndex = computed(() => {
  if (!selectedPhoto.value || !application.value?.photos) return -1;
  return application.value.photos.findIndex(p => p.id === selectedPhoto.value.id);
});

let touchStartX = 0;
let touchStartY = 0;

function nextPhoto() {
  if (!application.value?.photos) return;
  const idx = currentPhotoIndex.value;
  if (idx < application.value.photos.length - 1) {
    selectedPhoto.value = application.value.photos[idx + 1];
  }
}

function prevPhoto() {
  if (!application.value?.photos) return;
  const idx = currentPhotoIndex.value;
  if (idx > 0) {
    selectedPhoto.value = application.value.photos[idx - 1];
  }
}

function handleKeydown(e) {
  if (!selectedPhoto.value) return;
  if (e.key === 'ArrowRight') {
    nextPhoto();
  } else if (e.key === 'ArrowLeft') {
    prevPhoto();
  } else if (e.key === 'Escape') {
    selectedPhoto.value = null;
  }
}

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  // Only trigger swipe if horizontal movement is dominant and > 50px
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      nextPhoto();
    } else {
      prevPhoto();
    }
  }
}

// Keyboard listener
watch(selectedPhoto, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

const statusLabels = {
  PENDING_PAYMENT: 'Ожидает оплаты',
  NEW: 'Новая',
  ASSIGNED: 'Назначена',
  RESPONSE_GIVEN: 'Ответ дан',
  APPROVED: 'Одобрена',
  SENT_TO_CLIENT: 'Отправлена',
  DECLINED: 'Отклонена'
};

const skinTypeLabels = {
  DRY: 'Сухая',
  OILY: 'Жирная',
  COMBINATION: 'Комбинированная',
  NORMAL: 'Нормальная'
};

onMounted(async () => {
  await loadApplication();
  if (application.value?.status === 'NEW') {
    await loadDoctors();
  }
});

async function loadApplication() {
  try {
    const response = await getApplication(route.params.id);
    application.value = response.data;
    if (application.value.recommendation) {
      editedRecommendation.value = application.value.recommendation.text;
    }
  } catch (error) {
    console.error('Failed to load application:', error);
  }
}

async function loadDoctors() {
  try {
    const response = await getAvailableDoctors();
    availableDoctors.value = response.data;
  } catch (error) {
    console.error('Failed to load doctors:', error);
  }
}

function openPhoto(photo) {
  selectedPhoto.value = photo;
}

async function assignDoctor() {
  if (!selectedDoctorId.value) return;

  assigning.value = true;
  try {
    await apiAssignDoctor(application.value.id, selectedDoctorId.value);
    await loadApplication();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка назначения');
  } finally {
    assigning.value = false;
  }
}

async function saveRecommendation() {
  saving.value = true;
  try {
    await updateRecommendation(application.value.id, {
      text: editedRecommendation.value
    });
    await loadApplication();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка сохранения');
  } finally {
    saving.value = false;
  }
}

async function approveAndSend() {
  if (!confirm('Отправить рекомендации клиенту?')) return;

  approving.value = true;
  try {
    await approveApplication(application.value.id);
    await loadApplication();
    alert('Рекомендации отправлены клиенту!');
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка отправки');
  } finally {
    approving.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.detail-page {
  padding: 40px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(201, 169, 98, 0.1);
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 10px;
  cursor: pointer;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn svg {
  width: 18px;
  height: 18px;
  color: #C9A962;
}

.back-btn:hover {
  background: rgba(201, 169, 98, 0.2);
  border-color: #C9A962;
}

.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;
  flex: 1;
}

.status {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-pending_payment { background: rgba(251, 191, 36, 0.15); color: #FBBF24; }
.status-new { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
.status-assigned { background: rgba(201, 169, 98, 0.15); color: #C9A962; }
.status-response_given { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
.status-approved, .status-sent_to_client { background: rgba(74, 222, 128, 0.15); color: #4ADE80; }
.status-declined { background: rgba(248, 113, 113, 0.15); color: #F87171; }

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

.section {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(201, 169, 98, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-header svg {
  width: 24px;
  height: 24px;
  color: #C9A962;
}

.section h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
}

.section h3 {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section h3 svg {
  width: 18px;
  height: 18px;
  color: #C9A962;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item .value {
  font-size: 15px;
  color: #FFFFFF;
  line-height: 1.5;
}

.photos-section {
  margin-top: 28px;
}

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-thumb {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 28, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-overlay svg {
  width: 28px;
  height: 28px;
  color: #C9A962;
}

.photo-thumb:hover .photo-overlay {
  opacity: 1;
}

.photo-thumb:hover img {
  transform: scale(1.1);
}

.subsection {
  padding: 20px 0;
  border-bottom: 1px solid rgba(201, 169, 98, 0.1);
}

.subsection:first-child {
  padding-top: 0;
}

.subsection:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.client-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  flex-shrink: 0;
}

.client-name {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
}

.client-contact {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.select-doctor {
  width: 100%;
  padding: 14px 40px 14px 16px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.2) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C9A962'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 18px;
  color: #FFFFFF;
  cursor: pointer;
  appearance: none;
  font-family: 'Inter', sans-serif;
  margin-bottom: 12px;
}

.select-doctor:focus {
  outline: none;
  border-color: #C9A962;
}

.select-doctor option {
  background: #222224;
  color: #FFFFFF;
}

.doctor-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.doctor-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.doctor-badge span {
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
}

.btn {
  width: 100%;
  padding: 14px 20px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  margin-bottom: 10px;
}

.btn:last-child {
  margin-bottom: 0;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: linear-gradient(135deg, #C9A962 0%, #D4B978 100%);
  color: #1A1A1C;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recommendation-box textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 10px;
  resize: vertical;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.2);
  color: #FFFFFF;
}

.recommendation-box textarea:focus {
  outline: none;
  border-color: #C9A962;
}

.recommendation-box textarea:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 20px;
}

.history-list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: rgba(201, 169, 98, 0.2);
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  position: relative;
}

.history-dot {
  position: absolute;
  left: -20px;
  top: 16px;
  width: 14px;
  height: 14px;
  background: #C9A962;
  border-radius: 50%;
  border: 3px solid #1E1E20;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-status {
  font-weight: 600;
  color: #FFFFFF;
  font-size: 14px;
}

.history-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.history-comment {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close svg {
  width: 24px;
  height: 24px;
  color: #FFFFFF;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-nav svg {
  width: 24px;
  height: 24px;
  color: #FFFFFF;
}

.modal-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(201, 169, 98, 0.4);
}

.modal-prev {
  left: 24px;
}

.modal-next {
  right: 24px;
}

.modal-counter {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.05em;
  cursor: default;
}

.loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(201, 169, 98, 0.2);
  border-top-color: #C9A962;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .detail-page {
    padding: 24px;
  }

  .page-header {
    flex-wrap: wrap;
  }

  .page-header h1 {
    order: 3;
    width: 100%;
    margin-top: 12px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile-first compact design - iOS HIG / MD3 compliant */
@media (max-width: 480px) {
  .detail-page {
    padding: 0;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  /* Sticky Header with blur */
  .page-header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    padding-top: calc(12px + env(safe-area-inset-top, 0px));
    background: rgba(26, 26, 28, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201, 169, 98, 0.1);
    margin-bottom: 0;
    flex-wrap: nowrap;
  }

  .back-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
    font-size: 0;
    border-radius: 12px;
    background: rgba(201, 169, 98, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .back-btn:active {
    background: rgba(201, 169, 98, 0.2);
  }

  .back-btn svg {
    width: 20px;
    height: 20px;
  }

  .page-header h1 {
    flex: 1;
    font-size: 18px;
    margin: 0;
    order: 0;
    width: auto;
  }

  .page-header .status {
    padding: 6px 12px;
    font-size: 10px;
    border-radius: 14px;
    min-height: 28px;
    display: flex;
    align-items: center;
  }

  /* Content sections */
  .content-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .section {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 16px;
    border-bottom: 8px solid #151517;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section-header {
    margin-bottom: 16px;
    gap: 10px;
  }

  .section-header svg {
    width: 20px;
    height: 20px;
  }

  .section h2 {
    font-size: 18px;
  }

  .section h3 {
    font-size: 13px;
    margin-bottom: 14px;
    gap: 8px;
  }

  .section h3 svg {
    width: 16px;
    height: 16px;
  }

  /* Info Grid - vertical on mobile */
  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-item {
    padding: 14px 16px;
    border-radius: 12px;
    gap: 4px;
  }

  .info-item .label {
    font-size: 11px;
  }

  .info-item .value {
    font-size: 15px;
  }

  /* Swipeable Photo Gallery */
  .photos-section {
    margin: 20px -16px 0;
    padding: 0;
  }

  .photos-section h3 {
    padding: 0 16px;
    margin-bottom: 12px;
  }

  .photos-grid {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 0 16px 16px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .photos-grid::-webkit-scrollbar {
    display: none;
  }

  .photo-thumb {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  .photo-thumb img {
    border-radius: 12px;
  }

  .photo-overlay svg {
    width: 24px;
    height: 24px;
  }

  /* Subsections */
  .subsection {
    padding: 16px 0;
    border-bottom: 1px solid rgba(201, 169, 98, 0.08);
  }

  .subsection:last-child {
    border-bottom: none;
  }

  .client-info {
    padding: 14px;
    gap: 12px;
    border-radius: 12px;
  }

  .client-avatar {
    width: 48px;
    height: 48px;
    font-size: 16px;
  }

  .client-name {
    font-size: 16px;
  }

  .client-contact {
    font-size: 13px;
  }

  .select-doctor {
    padding: 14px 40px 14px 16px;
    font-size: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    min-height: 48px;
  }

  .doctor-badge {
    padding: 14px;
    gap: 12px;
    border-radius: 12px;
  }

  .doctor-avatar {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .doctor-badge span {
    font-size: 15px;
  }

  /* Buttons - touch friendly */
  .btn {
    min-height: 48px;
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 14px;
    gap: 8px;
    margin-bottom: 10px;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn svg {
    width: 18px;
    height: 18px;
  }

  /* Recommendation textarea */
  .recommendation-box textarea {
    padding: 14px;
    font-size: 16px;
    margin-bottom: 14px;
    border-radius: 12px;
    min-height: 180px;
  }

  .rec-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* History timeline */
  .history-list {
    padding-left: 20px;
  }

  .history-list::before {
    left: 6px;
  }

  .history-item {
    padding: 12px 0;
    gap: 12px;
  }

  .history-dot {
    left: -20px;
    top: 16px;
    width: 12px;
    height: 12px;
    border-width: 2px;
  }

  .history-status {
    font-size: 14px;
  }

  .history-date {
    font-size: 12px;
  }

  .history-comment {
    font-size: 13px;
  }

  /* Modal with safe areas */
  .modal {
    padding: env(safe-area-inset-top, 20px) 0 env(safe-area-inset-bottom, 20px);
  }

  .modal-close {
    top: calc(12px + env(safe-area-inset-top, 0px));
    right: 12px;
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .modal-close svg {
    width: 22px;
    height: 22px;
  }

  .modal img {
    max-width: 100%;
    max-height: calc(100vh - 100px);
    border-radius: 0;
  }

  .modal-nav {
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .modal-nav:active {
    background: rgba(255, 255, 255, 0.2);
  }

  .modal-nav svg {
    width: 20px;
    height: 20px;
  }

  .modal-prev {
    left: 12px;
  }

  .modal-next {
    right: 12px;
  }

  .modal-counter {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>
