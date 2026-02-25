<template>
  <div class="modern-page">
    <div class="page-header">
      <h1>📸 Таймлайн кожи</h1>
      <p class="subtitle">История фотографий и прогресс ухода</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем фотографии...</p>
    </div>

    <div v-else>
      <!-- Filters -->
      <div class="filters">
        <select v-model="filterZone" @change="loadTimeline">
          <option value="">Все зоны</option>
          <option v-for="zone in zones" :key="zone" :value="zone">
            {{ zone }}
          </option>
        </select>
      </div>

      <div v-if="!photos || photos.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-circle">
            <span class="empty-icon">📸</span>
          </div>
        </div>
        <h3>Фотографий пока нет</h3>
        <p>Фото автоматически сохраняются<br>из ваших консультаций</p>
      </div>

      <!-- Timeline -->
      <div v-else class="timeline">
        <div
          v-for="(group, date) in grouped"
          :key="date"
          class="timeline-group"
        >
          <div class="timeline-date">
            <strong>{{ formatDate(date) }}</strong>
          </div>

          <div class="photos-grid">
            <div
              v-for="photo in group"
              :key="photo.id"
              class="photo-card"
              @click="openPhoto(photo)"
            >
              <img
                :src="`/api/web/photos/${photo.id}`"
                :alt="photo.fileName"
                class="photo-img"
              >
              <div class="photo-info">
                <div v-if="photo.zone" class="photo-zone">{{ photo.zone }}</div>
                <div v-if="photo.tags && photo.tags.length" class="photo-tags">
                  <span v-for="tag in photo.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo modal -->
    <div v-if="selectedPhoto" class="modal-overlay" @click="closePhoto">
      <div class="photo-modal" @click.stop>
        <button class="close-btn" @click="closePhoto">✕</button>
        <img
          :src="`/api/web/photos/${selectedPhoto.id}`"
          :alt="selectedPhoto.fileName"
          class="photo-full"
        >
        <div class="photo-details">
          <div v-if="selectedPhoto.zone" class="detail-item">
            <strong>Зона:</strong> {{ selectedPhoto.zone }}
          </div>
          <div v-if="selectedPhoto.tags && selectedPhoto.tags.length" class="detail-item">
            <strong>Теги:</strong> {{ selectedPhoto.tags.join(', ') }}
          </div>
          <div v-if="selectedPhoto.description" class="detail-item">
            <strong>Описание:</strong> {{ selectedPhoto.description }}
          </div>
          <div class="detail-item">
            <strong>Дата:</strong> {{ formatDateTime(selectedPhoto.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getClientSkinTimeline } from '@/api/clientCabinet';

const loading = ref(true);
const photos = ref([]);
const grouped = ref({});
const zones = ref([]);
const filterZone = ref('');
const selectedPhoto = ref(null);

onMounted(loadTimeline);

async function loadTimeline() {
  loading.value = true;
  try {
    const response = await getClientSkinTimeline();
    photos.value = response.data.photos;
    grouped.value = response.data.grouped;
    zones.value = response.data.zones;
  } catch (error) {
    console.error('Timeline load error:', error);
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

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function openPhoto(photo) {
  selectedPhoto.value = photo;
}

function closePhoto() {
  selectedPhoto.value = null;
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

.filters {
  margin-bottom: 24px;
}

.filters select {
  padding: 10px 14px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1a1a1c;
  background: #fff;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.timeline-group {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.timeline-date {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f5e6d3;
}

.timeline-date strong {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  color: #3a2a1f;
  font-weight: 500;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #f5e6d3;
  transition: all 0.3s;
}

.photo-card:hover {
  border-color: #8b7355;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.photo-zone {
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

.photo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.close-btn {
  position: absolute;
  top: -50px;
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
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.photo-details {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  font-size: 14px;
  color: #1a1a1c;
}

.detail-item strong {
  color: #666;
  font-weight: 600;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
