<template>
  <div class="page">
    <h1>Дашборд</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.assigned }}</div>
        <div class="stat-label">Активные заявки</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">Завершённые</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Всего заявок</div>
      </div>
    </div>

    <div class="section">
      <h2>Активные заявки</h2>
      <div v-if="recentApplications.length === 0" class="empty">Нет активных заявок</div>
      <div v-else class="app-list">
        <router-link
          v-for="app in recentApplications"
          :key="app.id"
          :to="`/doctor/applications/${app.id}`"
          class="app-card"
        >
          <div class="app-info">
            <span class="app-client">{{ app.client?.fullName || 'Клиент' }}</span>
            <span class="app-date">{{ formatDate(app.assignedAt || app.createdAt) }}</span>
          </div>
          <span class="app-status">{{ statusLabel(app.status) }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDoctorDashboard } from '../../api/doctorCabinet.js';

const stats = ref({ assigned: 0, completed: 0, total: 0 });
const recentApplications = ref([]);

onMounted(async () => {
  try {
    const res = await getDoctorDashboard();
    stats.value = res.data.stats;
    recentApplications.value = res.data.recentApplications || [];
  } catch (e) {
    console.error('Dashboard error:', e);
  }
});

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function statusLabel(s) {
  const map = {
    ASSIGNED: 'Назначена',
    RESPONSE_GIVEN: 'Ответ дан',
    APPROVED: 'Одобрена',
    SENT_TO_CLIENT: 'Отправлена',
    DECLINED: 'Отклонена'
  };
  return map[s] || s;
}
</script>

<style scoped>
.page { padding: 32px; max-width: 900px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin-bottom: 24px; }
h2 { font-size: 18px; color: #1a1a1c; margin-bottom: 16px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
}
.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #8b7355;
}
.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.section {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  padding: 24px;
}
.empty {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 32px;
}
.app-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.app-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}
.app-card:hover { background: #f5f0ea; }
.app-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.app-client { font-weight: 500; color: #1a1a1c; font-size: 14px; }
.app-date { font-size: 12px; color: #999; }
.app-status {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f0e6d3;
  color: #8b7355;
}

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
