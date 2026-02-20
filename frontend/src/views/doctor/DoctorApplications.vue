<template>
  <div class="page">
    <h1>Мои заявки</h1>

    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="['filter-btn', { active: filter === f.value }]"
        @click="filter = f.value; pagination.page = 1; loadApplications()"
      >
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="applications.length === 0" class="empty">Нет заявок</div>
    <div v-else class="app-list">
      <router-link
        v-for="app in applications"
        :key="app.id"
        :to="`/doctor/applications/${app.id}`"
        class="app-card"
      >
        <div class="app-main">
          <div class="app-header">
            <span class="app-client">{{ app.client?.fullName || 'Клиент' }}</span>
            <span :class="['status-badge', `status-${app.status.toLowerCase()}`]">{{ statusLabel(app.status) }}</span>
          </div>
          <div class="app-meta">
            <span>{{ app.age }} лет</span>
            <span>{{ skinTypeLabel(app.skinType) }}</span>
            <span v-if="app.photoCount">{{ app.photoCount }} фото</span>
          </div>
          <div class="app-problems">{{ truncate(app.mainProblems, 100) }}</div>
        </div>
        <div class="app-date">{{ formatDate(app.assignedAt || app.createdAt) }}</div>
      </router-link>
    </div>

    <div v-if="pagination.totalPages > 1" class="pagination">
      <button :disabled="pagination.page <= 1" @click="pagination.page--; loadApplications()">Назад</button>
      <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button :disabled="pagination.page >= pagination.totalPages" @click="pagination.page++; loadApplications()">Далее</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDoctorApplications } from '../../api/doctorCabinet.js';

const applications = ref([]);
const loading = ref(true);
const filter = ref('');
const pagination = ref({ page: 1, totalPages: 1 });

const filters = [
  { label: 'Все', value: '' },
  { label: 'Назначенные', value: 'ASSIGNED' },
  { label: 'Ответ дан', value: 'RESPONSE_GIVEN' },
  { label: 'Отправлены', value: 'SENT_TO_CLIENT' },
  { label: 'Отклонённые', value: 'DECLINED' }
];

onMounted(() => loadApplications());

async function loadApplications() {
  loading.value = true;
  try {
    const params = { page: pagination.value.page, limit: 20 };
    if (filter.value) params.status = filter.value;
    const res = await getDoctorApplications(params);
    applications.value = res.data.applications;
    pagination.value = { page: res.data.pagination.page, totalPages: res.data.pagination.totalPages };
  } catch (e) {
    console.error('Error loading applications:', e);
  } finally {
    loading.value = false;
  }
}

function statusLabel(s) {
  const map = { ASSIGNED: 'Назначена', RESPONSE_GIVEN: 'Ответ дан', APPROVED: 'Одобрена', SENT_TO_CLIENT: 'Отправлена', DECLINED: 'Отклонена' };
  return map[s] || s;
}

function skinTypeLabel(t) {
  const map = { DRY: 'Сухая', OILY: 'Жирная', COMBINATION: 'Комбинированная', NORMAL: 'Нормальная' };
  return map[t] || t;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(s, len) {
  if (!s) return '';
  return s.length > len ? s.substring(0, len) + '...' : s;
}
</script>

<style scoped>
.page { padding: 32px; max-width: 900px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin-bottom: 24px; }

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8px 16px;
  border: 1px solid #e8e4db;
  border-radius: 20px;
  background: #fff;
  color: #666;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn.active {
  background: #8b7355;
  color: #fff;
  border-color: #8b7355;
}

.loading, .empty {
  text-align: center;
  padding: 48px;
  color: #999;
  font-size: 14px;
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.app-card {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}
.app-card:hover {
  border-color: #8b7355;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.app-main { flex: 1; }
.app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.app-client { font-weight: 600; font-size: 15px; color: #1a1a1c; }
.status-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
}
.status-assigned { background: #fef3c7; color: #92400e; }
.status-response_given { background: #dbeafe; color: #1e40af; }
.status-approved { background: #d1fae5; color: #065f46; }
.status-sent_to_client { background: #d1fae5; color: #065f46; }
.status-declined { background: #fee2e2; color: #991b1b; }
.app-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}
.app-problems { font-size: 13px; color: #666; line-height: 1.4; }
.app-date { font-size: 12px; color: #999; white-space: nowrap; margin-left: 16px; padding-top: 2px; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination button {
  padding: 8px 16px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination span { font-size: 13px; color: #666; }

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
  .app-card { flex-direction: column; }
  .app-date { margin-left: 0; margin-top: 8px; }
}
</style>
