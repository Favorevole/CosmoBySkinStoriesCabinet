<template>
  <div class="page">
    <h1>Мои пациенты</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="patients.length === 0" class="empty">Нет пациентов</div>
    <div v-else class="patient-list">
      <div v-for="p in patients" :key="p.id" class="patient-card" @click="togglePatient(p.id)">
        <div class="patient-header">
          <div class="patient-info">
            <span class="patient-name">{{ p.fullName || 'Клиент' }}</span>
            <span class="patient-meta">{{ p.applicationsCount }} заявок</span>
          </div>
          <span class="patient-date">{{ formatDate(p.lastApplicationDate) }}</span>
        </div>
        <div v-if="expandedPatient === p.id" class="patient-apps">
          <router-link
            v-for="a in p.applications"
            :key="a.id"
            :to="`/doctor/applications/${a.id}`"
            class="mini-app"
          >
            <span>Заявка #{{ a.id }}</span>
            <span :class="['status-badge', `status-${a.status.toLowerCase()}`]">{{ statusLabel(a.status) }}</span>
            <span class="mini-date">{{ formatDate(a.createdAt) }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDoctorPatients } from '../../api/doctorCabinet.js';

const patients = ref([]);
const loading = ref(true);
const expandedPatient = ref(null);

onMounted(async () => {
  try {
    const res = await getDoctorPatients();
    patients.value = res.data.patients || [];
  } catch (e) {
    console.error('Error loading patients:', e);
  } finally {
    loading.value = false;
  }
});

function togglePatient(id) {
  expandedPatient.value = expandedPatient.value === id ? null : id;
}

function statusLabel(s) {
  const map = { ASSIGNED: 'Назначена', RESPONSE_GIVEN: 'Ответ дан', APPROVED: 'Одобрена', SENT_TO_CLIENT: 'Отправлена', DECLINED: 'Отклонена' };
  return map[s] || s;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.page { padding: 32px; max-width: 800px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin-bottom: 24px; }
.loading, .empty { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.patient-list { display: flex; flex-direction: column; gap: 12px; }
.patient-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 12px;
  padding: 18px 20px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.patient-card:hover { border-color: #8b7355; }
.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.patient-info { display: flex; flex-direction: column; gap: 2px; }
.patient-name { font-weight: 600; font-size: 15px; color: #1a1a1c; }
.patient-meta { font-size: 12px; color: #999; }
.patient-date { font-size: 12px; color: #999; }

.patient-apps {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e4db;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mini-app {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  text-decoration: none;
  color: #1a1a1c;
  font-size: 13px;
  transition: background 0.2s;
}
.mini-app:hover { background: #f5f0ea; }
.mini-date { margin-left: auto; font-size: 11px; color: #999; }

.status-badge { font-size: 11px; font-weight: 500; padding: 2px 6px; border-radius: 4px; }
.status-assigned { background: #fef3c7; color: #92400e; }
.status-response_given { background: #dbeafe; color: #1e40af; }
.status-approved { background: #d1fae5; color: #065f46; }
.status-sent_to_client { background: #d1fae5; color: #065f46; }
.status-declined { background: #fee2e2; color: #991b1b; }

@media (max-width: 640px) {
  .page { padding: 20px 16px; }
}
</style>
