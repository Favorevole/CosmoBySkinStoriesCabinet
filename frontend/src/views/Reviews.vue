<template>
  <div class="reviews-page">
    <header class="page-header">
      <div class="header-left">
        <h1>Отзывы</h1>
        <p class="subtitle">Модерация отзывов клиентов</p>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-card highlight">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">На модерации</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ approvedCount }}</div>
          <div class="stat-label">Одобрено</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ reviews.length }}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
    </div>

    <button class="btn btn-add" @click="showCreateModal = true">+ Добавить отзыв</button>

    <!-- Filter -->
    <div class="filter-row">
      <button
        :class="['filter-btn', { active: filter === 'all' }]"
        @click="filter = 'all'"
      >Все</button>
      <button
        :class="['filter-btn', { active: filter === 'pending' }]"
        @click="filter = 'pending'"
      >На модерации</button>
      <button
        :class="['filter-btn', { active: filter === 'approved' }]"
        @click="filter = 'approved'"
      >Одобренные</button>
    </div>

    <div class="reviews-list" v-if="!loading">
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="review-card"
      >
        <div class="review-header">
          <div class="review-stars">
            <span v-for="s in review.rating" :key="s" class="star">&#x2B50;</span>
          </div>
          <span :class="['status', review.isApproved ? 'status-approved' : 'status-pending']">
            {{ review.isApproved ? 'Одобрен' : 'На модерации' }}
          </span>
        </div>

        <p class="review-text" v-if="review.text">{{ review.text }}</p>
        <p class="review-text empty" v-else-if="!review.imageS3Key">Без комментария</p>

        <div v-if="review.imageS3Key" class="review-image-wrap">
          <img :src="getAdminImageUrl(review.id)" alt="Скриншот отзыва" class="review-thumbnail" />
        </div>

        <div class="review-meta">
          <span v-if="review.clientName">{{ review.clientName }}</span>
          <span v-if="review.application">Заявка #{{ review.application.displayNumber || review.application.id }}</span>
          <span>{{ formatDate(review.createdAt) }}</span>
        </div>

        <div class="review-actions">
          <button
            v-if="!review.isApproved"
            @click="approve(review)"
            class="btn btn-success btn-sm"
          >Одобрить</button>
          <button
            v-if="review.isApproved"
            @click="reject(review)"
            class="btn btn-secondary btn-sm"
          >Снять</button>
          <button
            @click="remove(review)"
            class="btn btn-danger btn-sm"
          >Удалить</button>
        </div>
      </div>

      <div v-if="filteredReviews.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
        <h3>Нет отзывов</h3>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>

    <!-- Create Review Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-content">
          <button class="modal-close" @click="showCreateModal = false">&times;</button>
          <h2>Добавить отзыв</h2>

          <form @submit.prevent="handleCreate" class="create-form">
            <div class="form-group">
              <label>Рейтинг</label>
              <div class="star-picker">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="star-pick"
                  :class="{ active: s <= newReview.rating }"
                  @click="newReview.rating = s"
                >&#x2B50;</span>
              </div>
            </div>

            <div class="form-group">
              <label>Имя клиента (необязательно)</label>
              <input v-model="newReview.clientName" type="text" placeholder="Имя" />
            </div>

            <div class="form-group">
              <label>Текст отзыва (необязательно)</label>
              <textarea v-model="newReview.text" rows="4" placeholder="Текст отзыва..."></textarea>
            </div>

            <div class="form-group">
              <label>Скриншот (необязательно)</label>
              <input type="file" accept="image/*" @change="onFileChange" ref="fileInput" />
              <img v-if="imagePreview" :src="imagePreview" class="image-preview" alt="Preview" />
            </div>

            <p v-if="createError" class="form-error">{{ createError }}</p>

            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Создание...' : 'Создать' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAdminReviews, approveReviewApi, rejectReviewApi, deleteReviewApi, createReviewApi, getAdminReviewImageUrl } from '../api/index.js';

const reviews = ref([]);
const loading = ref(true);
const filter = ref('all');

const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref('');
const imagePreview = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);

const newReview = ref({
  rating: 5,
  clientName: '',
  text: ''
});

const pendingCount = computed(() => reviews.value.filter(r => !r.isApproved).length);
const approvedCount = computed(() => reviews.value.filter(r => r.isApproved).length);

const filteredReviews = computed(() => {
  if (filter.value === 'pending') return reviews.value.filter(r => !r.isApproved);
  if (filter.value === 'approved') return reviews.value.filter(r => r.isApproved);
  return reviews.value;
});

function getAdminImageUrl(reviewId) {
  return getAdminReviewImageUrl(reviewId);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (ev) => { imagePreview.value = ev.target.result; };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    imagePreview.value = null;
  }
}

async function handleCreate() {
  createError.value = '';

  if (!newReview.value.text && !selectedFile.value) {
    createError.value = 'Укажите текст или загрузите скриншот';
    return;
  }

  creating.value = true;
  try {
    const formData = new FormData();
    formData.append('rating', newReview.value.rating);
    if (newReview.value.text) formData.append('text', newReview.value.text);
    if (newReview.value.clientName) formData.append('clientName', newReview.value.clientName);
    if (selectedFile.value) formData.append('image', selectedFile.value);

    await createReviewApi(formData);

    showCreateModal.value = false;
    newReview.value = { rating: 5, clientName: '', text: '' };
    selectedFile.value = null;
    imagePreview.value = null;
    await loadReviews();
  } catch (error) {
    createError.value = error.response?.data?.error || 'Ошибка при создании отзыва';
  } finally {
    creating.value = false;
  }
}

async function loadReviews() {
  try {
    const response = await getAdminReviews();
    reviews.value = response.data;
  } catch (error) {
    console.error('Failed to load reviews:', error);
  } finally {
    loading.value = false;
  }
}

async function approve(review) {
  try {
    await approveReviewApi(review.id);
    review.isApproved = true;
  } catch (error) {
    console.error('Failed to approve review:', error);
  }
}

async function reject(review) {
  try {
    await rejectReviewApi(review.id);
    review.isApproved = false;
  } catch (error) {
    console.error('Failed to reject review:', error);
  }
}

async function remove(review) {
  if (!confirm('Удалить отзыв?')) return;
  try {
    await deleteReviewApi(review.id);
    reviews.value = reviews.value.filter(r => r.id !== review.id);
  } catch (error) {
    console.error('Failed to delete review:', error);
  }
}

onMounted(loadReviews);
</script>

<style scoped>
.reviews-page {
  padding: 40px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-top: 4px;
}

.btn-add {
  padding: 12px 24px;
  background: #C9A962;
  border: none;
  color: #000;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: 16px;
}

.btn-add:hover {
  background: #D4B96F;
  transform: translateY(-1px);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card.highlight {
  border-color: rgba(201, 169, 98, 0.2);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 22px;
  height: 22px;
  color: #C9A962;
}

.stat-icon.success svg {
  color: #10B981;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: rgba(201, 169, 98, 0.3);
  color: #FFFFFF;
}

.filter-btn.active {
  background: rgba(201, 169, 98, 0.15);
  border-color: #C9A962;
  color: #C9A962;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-stars .star {
  font-size: 18px;
}

.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.review-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-text.empty {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.review-image-wrap {
  margin-bottom: 12px;
}

.review-thumbnail {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.btn-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.btn-success:hover {
  background: rgba(16, 185, 129, 0.25);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-primary {
  background: #C9A962;
  color: #000;
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border-radius: 10px;
}

.btn-primary:hover {
  background: #D4B96F;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(201, 169, 98, 0.3);
  border-top-color: #C9A962;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #1E1E20;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  padding: 32px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content h2 {
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 24px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.form-group input[type="text"],
.form-group textarea {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px;
  color: #FFFFFF;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  border-color: #C9A962;
}

.form-group input[type="file"] {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.star-picker {
  display: flex;
  gap: 4px;
}

.star-pick {
  font-size: 24px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star-pick.active {
  opacity: 1;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 10px;
  margin-top: 8px;
  object-fit: contain;
}

.form-error {
  color: #EF4444;
  font-size: 13px;
}

@media (max-width: 900px) {
  .reviews-page {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .filter-row {
    flex-wrap: wrap;
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .reviews-page {
    padding: 16px;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
