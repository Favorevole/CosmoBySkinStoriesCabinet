<template>
  <div class="page">
    <h1>Таймлайн кожи</h1>
    <p class="subtitle">История фотографий и прогресс ухода за кожей</p>

    <div v-if="loading" class="loading">Загрузка...</div>

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

      <div v-if="!photos || photos.length === 0" class="empty">
        <p>Фотографий пока нет</p>
        <p class="hint">Фото автоматически сохраняются из консультаций</p>
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
import axios from 'axios';

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
    const token = localStorage.getItem('clientToken');
    const params = {};
    if (filterZone.value) params.zone = filterZone.value;

    const response = await axios.get('/api/client/photos/timeline', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

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
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 20px;
}

.timeline-date {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8e4db;
}

.timeline-date strong {
  font-size: 18px;
  color: #1a1a1c;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e8e4db;
  transition: all 0.2s;
}

.photo-card:hover {
  border-color: #8b7355;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
