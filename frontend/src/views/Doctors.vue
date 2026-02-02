<template>
  <div class="doctors-page">
    <header class="page-header">
      <h1>Врачи</h1>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ doctors.length }}</div>
        <div class="stat-label">Всего</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-value">{{ pendingCount }}</div>
        <div class="stat-label">Ожидают подтверждения</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeCount }}</div>
        <div class="stat-label">Активных</div>
      </div>
    </div>

    <div class="doctors-list" v-if="!loading">
      <div
        v-for="doctor in doctors"
        :key="doctor.id"
        class="doctor-card"
      >
        <div class="doctor-header">
          <div class="doctor-name">{{ doctor.fullName }}</div>
          <span :class="['status', `status-${doctor.status.toLowerCase()}`]">
            {{ statusLabels[doctor.status] }}
          </span>
        </div>

        <div class="doctor-info">
          <div class="info-row" v-if="doctor.telegramUsername">
            <span class="label">Telegram:</span>
            <span>@{{ doctor.telegramUsername }}</span>
          </div>
          <div class="info-row" v-if="doctor.specialization">
            <span class="label">Специализация:</span>
            <span>{{ doctor.specialization }}</span>
          </div>
          <div class="info-row">
            <span class="label">Доступен:</span>
            <span>{{ doctor.isAvailable ? 'Да' : 'Нет' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Регистрация:</span>
            <span>{{ formatDate(doctor.createdAt) }}</span>
          </div>
        </div>

        <div class="doctor-actions">
          <template v-if="doctor.status === 'PENDING'">
            <button @click="approveDoctor(doctor.id)" class="btn btn-primary">
              Подтвердить
            </button>
            <button @click="blockDoctor(doctor.id)" class="btn btn-danger">
              Отклонить
            </button>
          </template>
          <template v-else-if="doctor.status === 'ACTIVE'">
            <button
              @click="toggleAvailability(doctor)"
              class="btn btn-secondary"
            >
              {{ doctor.isAvailable ? 'Сделать недоступным' : 'Сделать доступным' }}
            </button>
            <button @click="blockDoctor(doctor.id)" class="btn btn-danger">
              Заблокировать
            </button>
          </template>
          <template v-else>
            <button @click="approveDoctor(doctor.id)" class="btn btn-primary">
              Разблокировать
            </button>
          </template>
        </div>
      </div>

      <div v-if="doctors.length === 0" class="empty-state">
        Нет зарегистрированных врачей
      </div>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getDoctors,
  approveDoctor as apiApproveDoctor,
  blockDoctor as apiBlockDoctor,
  updateDoctor
} from '../api';

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
  padding: 30px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
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
  background: var(--warning);
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

.doctors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doctor-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.doctor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.doctor-name {
  font-size: 18px;
  font-weight: 600;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: #FEF3C7;
  color: #B45309;
}

.status-active {
  background: #D1FAE5;
  color: #047857;
}

.status-blocked {
  background: #FEE2E2;
  color: #B91C1C;
}

.doctor-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  font-size: 14px;
}

.info-row .label {
  color: var(--gray-500);
  margin-right: 8px;
}

.doctor-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-danger {
  background: #FEE2E2;
  color: #B91C1C;
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
</style>
