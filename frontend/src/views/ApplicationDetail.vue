<template>
  <div class="detail-page" v-if="application">
    <header class="page-header">
      <button @click="$router.back()" class="back-btn">← Назад</button>
      <h1>Заявка #{{ application.id }}</h1>
      <span :class="['status', `status-${application.status.toLowerCase()}`]">
        {{ statusLabels[application.status] }}
      </span>
    </header>

    <div class="content-grid">
      <!-- Left: Questionnaire -->
      <div class="section questionnaire">
        <h2>Анкета</h2>
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
            <span class="label">Проблемы</span>
            <span class="value">{{ application.mainProblems }}</span>
          </div>
          <div class="info-item full" v-if="application.additionalComment">
            <span class="label">Комментарий</span>
            <span class="value">{{ application.additionalComment }}</span>
          </div>
        </div>

        <h3>Фотографии ({{ application.photos.length }})</h3>
        <div class="photos-grid">
          <div
            v-for="photo in application.photos"
            :key="photo.id"
            class="photo-thumb"
            @click="openPhoto(photo)"
          >
            <img :src="getPhotoUrl(application.id, photo.id)" alt="">
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="section actions">
        <!-- Client Info -->
        <div class="subsection">
          <h3>Клиент</h3>
          <p>{{ application.client?.fullName || 'Не указано' }}</p>
          <p v-if="application.client?.telegramUsername">
            @{{ application.client.telegramUsername }}
          </p>
          <p v-if="application.client?.email">{{ application.client.email }}</p>
        </div>

        <!-- Assign Doctor (if NEW) -->
        <div class="subsection" v-if="application.status === 'NEW'">
          <h3>Назначить врача</h3>
          <select v-model="selectedDoctorId">
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
            {{ assigning ? 'Назначение...' : 'Назначить' }}
          </button>
        </div>

        <!-- Doctor Info (if assigned) -->
        <div class="subsection" v-if="application.doctor">
          <h3>Назначенный врач</h3>
          <p>{{ application.doctor.fullName }}</p>
        </div>

        <!-- Recommendation (if exists) -->
        <div class="subsection" v-if="application.recommendation">
          <h3>Рекомендации врача</h3>
          <div class="recommendation-box">
            <textarea
              v-model="editedRecommendation"
              rows="8"
              :disabled="application.status === 'SENT_TO_CLIENT'"
            ></textarea>
            <div class="rec-actions" v-if="application.status === 'RESPONSE_GIVEN'">
              <button @click="saveRecommendation" :disabled="saving" class="btn btn-secondary">
                {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
              <button @click="approveAndSend" :disabled="approving" class="btn btn-primary">
                {{ approving ? 'Отправка...' : 'Одобрить и отправить' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Status History -->
        <div class="subsection">
          <h3>История</h3>
          <div class="history-list">
            <div v-for="item in application.statusHistory" :key="item.id" class="history-item">
              <span class="history-status">{{ statusLabels[item.toStatus] }}</span>
              <span class="history-date">{{ formatDate(item.createdAt) }}</span>
              <span class="history-comment" v-if="item.comment">{{ item.comment }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <div class="modal" v-if="selectedPhoto" @click="selectedPhoto = null">
      <img :src="getPhotoUrl(application.id, selectedPhoto.id)" alt="">
    </div>
  </div>

  <div v-else class="loading">Загрузка...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  getApplication,
  getAvailableDoctors,
  assignDoctor as apiAssignDoctor,
  updateRecommendation,
  approveApplication,
  getPhotoUrl
} from '../api';

const route = useRoute();

const application = ref(null);
const availableDoctors = ref([]);
const selectedDoctorId = ref('');
const selectedPhoto = ref(null);
const editedRecommendation = ref('');
const assigning = ref(false);
const saving = ref(false);
const approving = ref(false);

const statusLabels = {
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
  padding: 30px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
}

.page-header h1 {
  font-size: 24px;
  flex: 1;
}

.status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-new { background: #DBEAFE; color: #1D4ED8; }
.status-assigned { background: #FEF3C7; color: #B45309; }
.status-response_given { background: #E0E7FF; color: #4338CA; }
.status-approved, .status-sent_to_client { background: #D1FAE5; color: #047857; }
.status-declined { background: #FEE2E2; color: #B91C1C; }

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.section h2 {
  margin-bottom: 20px;
}

.section h3 {
  font-size: 16px;
  margin: 20px 0 12px;
  color: var(--gray-700);
}

.section h3:first-child {
  margin-top: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 12px;
  color: var(--gray-500);
  text-transform: uppercase;
}

.info-item .value {
  font-size: 16px;
}

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-thumb {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.subsection {
  padding: 16px 0;
  border-bottom: 1px solid var(--gray-200);
}

.subsection:last-child {
  border-bottom: none;
}

.subsection h3 {
  margin-top: 0;
}

.subsection select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  margin-bottom: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recommendation-box textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 8px;
}

.history-status {
  font-weight: 600;
}

.history-date {
  font-size: 12px;
  color: var(--gray-500);
}

.history-comment {
  font-size: 14px;
  color: var(--gray-600);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.loading {
  text-align: center;
  padding: 60px;
  color: var(--gray-500);
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
