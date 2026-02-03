<template>
  <div class="doctors-page">
    <header class="page-header">
      <h1>Врачи</h1>
      <p class="subtitle">Управление специалистами</p>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ doctors.length }}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Ожидают подтверждения</div>
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
          <div class="stat-value">{{ activeCount }}</div>
          <div class="stat-label">Активных</div>
        </div>
      </div>
    </div>

    <div class="doctors-list" v-if="!loading">
      <div
        v-for="doctor in doctors"
        :key="doctor.id"
        class="doctor-card"
      >
        <div class="doctor-header">
          <div class="doctor-avatar">
            {{ doctor.fullName.substring(0, 2).toUpperCase() }}
          </div>
          <div class="doctor-title">
            <div class="doctor-name">{{ doctor.fullName }}</div>
            <div class="doctor-spec" v-if="doctor.specialization">{{ doctor.specialization }}</div>
          </div>
          <span :class="['status', `status-${doctor.status.toLowerCase()}`]">
            {{ statusLabels[doctor.status] }}
          </span>
        </div>

        <div class="doctor-info">
          <div class="info-row" v-if="doctor.telegramUsername">
            <svg viewBox="0 0 24 24" fill="currentColor" class="info-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>@{{ doctor.telegramUsername }}</span>
          </div>
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>{{ doctor.isAvailable ? 'Доступен для заявок' : 'Недоступен' }}</span>
          </div>
          <div class="info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Регистрация: {{ formatDate(doctor.createdAt) }}</span>
          </div>
        </div>

        <div class="doctor-actions">
          <template v-if="doctor.status === 'PENDING'">
            <button @click="approveDoctor(doctor.id)" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Подтвердить
            </button>
            <button @click="blockDoctor(doctor.id)" class="btn btn-danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Отклонить
            </button>
          </template>
          <template v-else-if="doctor.status === 'ACTIVE'">
            <button
              @click="toggleAvailability(doctor)"
              class="btn btn-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              {{ doctor.isAvailable ? 'Сделать недоступным' : 'Сделать доступным' }}
            </button>
            <button @click="blockDoctor(doctor.id)" class="btn btn-danger-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Заблокировать
            </button>
          </template>
          <template v-else>
            <button @click="approveDoctor(doctor.id)" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Разблокировать
            </button>
          </template>
        </div>
      </div>

      <div v-if="doctors.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
        </div>
        <h3>Нет зарегистрированных врачей</h3>
        <p>Врачи появятся здесь после регистрации через Telegram-бот</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getDoctors,
  approveDoctor as apiApproveDoctor,
  blockDoctor as apiBlockDoctor,
  updateDoctor
} from '../api/index.js';

const doctors = ref([]);
const loading = ref(true);

const statusLabels = {
  PENDING: 'Ожидает',
  ACTIVE: 'Активен',
  BLOCKED: 'Заблокирован'
};

const pendingCount = computed(() =>
  doctors.value.filter(d => d.status === 'PENDING').length
);

const activeCount = computed(() =>
  doctors.value.filter(d => d.status === 'ACTIVE').length
);

onMounted(async () => {
  await loadDoctors();
});

async function loadDoctors() {
  loading.value = true;
  try {
    const response = await getDoctors();
    doctors.value = response.data;
  } catch (error) {
    console.error('Failed to load doctors:', error);
  } finally {
    loading.value = false;
  }
}

async function approveDoctor(id) {
  try {
    await apiApproveDoctor(id);
    await loadDoctors();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка');
  }
}

async function blockDoctor(id) {
  if (!confirm('Заблокировать врача?')) return;

  try {
    await apiBlockDoctor(id);
    await loadDoctors();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка');
  }
}

async function toggleAvailability(doctor) {
  try {
    await updateDoctor(doctor.id, { isAvailable: !doctor.isAvailable });
    await loadDoctors();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка');
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU');
}
</script>

<style scoped>
.doctors-page {
  padding: 40px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(201, 169, 98, 0.1);
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(201, 169, 98, 0.2);
  transform: translateY(-2px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border-color: rgba(201, 169, 98, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(201, 169, 98, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: #C9A962;
}

.stat-icon.success svg {
  color: #4ADE80;
}

.stat-card.highlight .stat-icon {
  background: rgba(255, 255, 255, 0.15);
}

.stat-card.highlight .stat-icon svg {
  color: #FFFFFF;
}

.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.stat-card.highlight .stat-label {
  color: rgba(255, 255, 255, 0.7);
}

.doctors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doctor-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(201, 169, 98, 0.1);
  transition: all 0.3s ease;
}

.doctor-card:hover {
  border-color: rgba(201, 169, 98, 0.2);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.doctor-avatar {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #5D1A2D 0%, #7A2339 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  flex-shrink: 0;
}

.doctor-title {
  flex: 1;
}

.doctor-name {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
}

.doctor-spec {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: rgba(201, 169, 98, 0.15);
  color: #C9A962;
}

.status-active {
  background: rgba(74, 222, 128, 0.15);
  color: #4ADE80;
}

.status-blocked {
  background: rgba(248, 113, 113, 0.15);
  color: #F87171;
}

.doctor-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.info-icon {
  width: 16px;
  height: 16px;
  color: #C9A962;
  flex-shrink: 0;
}

.doctor-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #C9A962 0%, #D4B978 100%);
  color: #1A1A1C;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
  color: #FFFFFF;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn-danger-outline {
  background: transparent;
  color: #F87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.btn-danger-outline:hover {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.5);
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border-radius: 16px;
  border: 1px solid rgba(201, 169, 98, 0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(201, 169, 98, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #C9A962;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

@media (max-width: 768px) {
  .doctors-page {
    padding: 24px;
  }

  .stats-row {
    flex-direction: column;
  }

  .doctor-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
