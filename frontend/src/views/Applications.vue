<template>
  <div class="applications-page">
    <header class="page-header">
      <h1>Заявки</h1>
      <div class="filters">
        <select v-model="filters.status" @change="loadApplications">
          <option value="">Все статусы</option>
          <option value="NEW">Новые</option>
          <option value="ASSIGNED">Назначены</option>
          <option value="RESPONSE_GIVEN">Ответ дан</option>
          <option value="APPROVED">Одобрены</option>
          <option value="SENT_TO_CLIENT">Отправлены</option>
          <option value="DECLINED">Отклонены</option>
        </select>
      </div>
    </header>

    <div class="stats-row" v-if="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Всего</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-value">{{ stats.byStatus?.NEW || 0 }}</div>
        <div class="stat-label">Новых</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.byStatus?.RESPONSE_GIVEN || 0 }}</div>
        <div class="stat-label">На проверке</div>
      </div>
    </div>

    <div class="applications-list" v-if="!loading">
      <div
        v-for="app in applications"
        :key="app.id"
        class="application-card"
        @click="$router.push(`/admin/applications/${app.id}`)"
      >
        <div class="app-header">
          <span class="app-id">#{{ app.id }}</span>
          <span :class="['status', `status-${app.status.toLowerCase()}`]">
            {{ statusLabels[app.status] }}
          </span>
        </div>
        <div class="app-body">
          <div class="app-info">
            <div class="info-row">
              <span class="label">Клиент:</span>
              <span>{{ app.client?.fullName || app.client?.telegramUsername || 'Не указано' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Возраст:</span>
              <span>{{ app.age }} лет</span>
            </div>
            <div class="info-row">
              <span class="label">Тип кожи:</span>
              <span>{{ skinTypeLabels[app.skinType] }}</span>
            </div>
            <div class="info-row">
              <span class="label">Фото:</span>
              <span>{{ app.photoCount }} шт.</span>
            </div>
          </div>
          <div class="app-meta">
            <div class="meta-item" v-if="app.doctor">
              <span class="label">Врач:</span>
              <span>{{ app.doctor.fullName }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Создана:</span>
              <span>{{ formatDate(app.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="applications.length === 0" class="empty-state">
        Нет заявок
      </div>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button
        @click="changePage(pagination.page - 1)"
        :disabled="pagination.page === 1"
      >
        ← Назад
      </button>
      <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
      >
        Вперёд →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApplications, getDashboardStats } from '../api';

const applications = ref([]);
const loading = ref(true);
const stats = ref(null);
const pagination = ref({ page: 1, totalPages: 1 });
const filters = ref({ status: '' });

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
  await Promise.all([loadApplications(), loadStats()]);
});

async function loadApplications() {
  loading.value = true;
  try {
    const response = await getApplications({
      status: filters.value.status || undefined,
      page: pagination.value.page,
      limit: 20
    });
    applications.value = response.data.applications;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Failed to load applications:', error);
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const response = await getDashboardStats();
    stats.value = response.data.applications;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function changePage(page) {
  pagination.value.page = page;
  loadApplications();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.applications-page {
  padding: 30px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
}

.filters select {
  padding: 10px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-card.highlight {
  background: var(--primary);
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  opacity: 0.7;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.application-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.app-id {
  font-size: 18px;
  font-weight: 600;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-new {
  background: #DBEAFE;
  color: #1D4ED8;
}

.status-assigned {
  background: #FEF3C7;
  color: #B45309;
}

.status-response_given {
  background: #E0E7FF;
  color: #4338CA;
}

.status-approved {
  background: #D1FAE5;
  color: #047857;
}

.status-sent_to_client {
  background: #D1FAE5;
  color: #047857;
}

.status-declined {
  background: #FEE2E2;
  color: #B91C1C;
}

.app-body {
  display: flex;
  justify-content: space-between;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row, .meta-item {
  font-size: 14px;
}

.label {
  color: var(--gray-500);
  margin-right: 8px;
}

.app-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--gray-500);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--gray-500);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
}

.pagination button {
  padding: 10px 20px;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
