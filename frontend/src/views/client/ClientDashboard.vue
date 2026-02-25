<template>
  <div class="page">
    <h1>Dashboard</h1>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="dashboard-grid">
      <!-- Stats cards -->
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalConsultations }}</div>
          <div class="stat-label">Всего консультаций</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pendingCount }}</div>
          <div class="stat-label">Активных заявок</div>
        </div>
      </div>

      <!-- Latest consultation -->
      <div v-if="stats.latestApplication" class="latest-card">
        <h3>Последняя консультация</h3>
        <div class="latest-info">
          <div class="latest-date">
            📅 {{ formatDate(stats.latestApplication.createdAt) }}
          </div>
          <div class="latest-status">
            Статус: <span :class="'status-' + stats.latestApplication.status">
              {{ getStatusText(stats.latestApplication.status) }}
            </span>
          </div>
          <div v-if="stats.latestApplication.doctor" class="latest-doctor">
            👨‍⚕️ Врач: {{ stats.latestApplication.doctor.fullName }}
          </div>
          <router-link
            :to="`/client/consultations/${stats.latestApplication.id}`"
            class="btn-link"
          >
            Подробнее →
          </router-link>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="actions-card">
        <h3>Быстрые действия</h3>
        <div class="actions">
          <router-link to="/client/consultations" class="action-btn">
            📋 Мои консультации
          </router-link>
          <a href="/" class="action-btn">
            ➕ Новая консультация
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(true);
const stats = ref({
  totalConsultations: 0,
  pendingCount: 0,
  latestApplication: null
});

onMounted(loadDashboard);

async function loadDashboard() {
  loading.value = true;
  try {
    const token = localStorage.getItem('clientToken');
    const response = await axios.get('/api/client/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('Dashboard load error:', error);
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
</script>

<style scoped>
.page {
  max-width: 1000px;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1a1c;
  margin: 0 0 32px 0;
}

h3 {
  font-size: 18px;
  color: #1a1a1c;
  margin: 0 0 16px 0;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #999;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf9f7;
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1c;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.latest-card {
  grid-column: span 2;
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
}

.latest-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.latest-date,
.latest-status,
.latest-doctor {
  font-size: 14px;
  color: #666;
}

.latest-status span {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
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

.btn-link {
  display: inline-block;
  color: #8b7355;
  font-weight: 600;
  text-decoration: none;
  margin-top: 8px;
}

.btn-link:hover {
  text-decoration: underline;
}

.actions-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 24px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: block;
  padding: 14px 20px;
  background: #faf9f7;
  border: 1px solid #e8e4db;
  border-radius: 10px;
  color: #1a1a1c;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #8b7355;
  color: #fff;
  border-color: #8b7355;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .latest-card {
    grid-column: span 1;
  }
}
</style>
