<template>
  <div class="page">
    <h1>Статистика</h1>

    <div class="period-tabs">
      <button
        v-for="p in periods"
        :key="p.value"
        :class="['tab', { active: period === p.value }]"
        @click="changePeriod(p.value)"
      >{{ p.label }}</button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalAssigned }}</div>
          <div class="stat-label">Всего назначено</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalCompleted }}</div>
          <div class="stat-label">Завершено</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ Math.round(stats.completionRate * 100) }}%</div>
          <div class="stat-label">Процент завершения</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.avgResponseTimeHours != null ? stats.avgResponseTimeHours + ' ч' : '—' }}</div>
          <div class="stat-label">Среднее время ответа</div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h2>Заявки по дням</h2>
          <div v-if="stats.applicationsOverTime.length === 0" class="empty-chart">Нет данных за период</div>
          <Bar v-else :data="barChartData" :options="barChartOptions" />
        </div>
        <div class="chart-card">
          <h2>По статусам</h2>
          <div v-if="Object.keys(stats.statusBreakdown).length === 0" class="empty-chart">Нет данных</div>
          <Doughnut v-else :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { getDoctorStats } from '../../api/doctorCabinet.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'all', label: 'Всё время' }
];

const period = ref('month');
const loading = ref(true);
const error = ref(null);
const stats = ref({
  applicationsOverTime: [],
  avgResponseTimeHours: null,
  completionRate: 0,
  statusBreakdown: {},
  totalCompleted: 0,
  totalAssigned: 0
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await getDoctorStats(period.value);
    stats.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки статистики';
  } finally {
    loading.value = false;
  }
}

function changePeriod(p) {
  period.value = p;
  load();
}

const barChartData = computed(() => ({
  labels: stats.value.applicationsOverTime.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }),
  datasets: [{
    label: 'Заявки',
    data: stats.value.applicationsOverTime.map(d => d.count),
    backgroundColor: '#8b7355',
    borderRadius: 6,
    maxBarThickness: 40
  }]
}));

const barChartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } }
  }
};

const statusLabels = {
  ASSIGNED: 'Назначена',
  RESPONSE_GIVEN: 'Ответ дан',
  APPROVED: 'Одобрена',
  SENT_TO_CLIENT: 'Отправлена',
  DECLINED: 'Отклонена'
};

const statusColors = {
  ASSIGNED: '#f59e0b',
  RESPONSE_GIVEN: '#3b82f6',
  APPROVED: '#10b981',
  SENT_TO_CLIENT: '#8b7355',
  DECLINED: '#ef4444'
};

const doughnutData = computed(() => {
  const entries = Object.entries(stats.value.statusBreakdown);
  return {
    labels: entries.map(([k]) => statusLabels[k] || k),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([k]) => statusColors[k] || '#999'),
      borderWidth: 0
    }]
  };
});

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
  }
};

onMounted(load);
</script>

<style scoped>
.page { padding: 32px; max-width: 900px; }
h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #1a1a1c; margin-bottom: 24px; }
h2 { font-size: 16px; color: #1a1a1c; margin-bottom: 16px; }
.loading { text-align: center; padding: 48px; color: #999; font-size: 14px; }

.period-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.tab {
  padding: 8px 18px;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.tab:hover { border-color: #8b7355; color: #8b7355; }
.tab.active { background: #8b7355; color: #fff; border-color: #8b7355; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #8b7355;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}
.chart-card {
  background: #fff;
  border: 1px solid #e8e4db;
  border-radius: 14px;
  padding: 24px;
}
.empty-chart {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 32px 0;
}

.error {
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
