<template>
  <div class="applications-page">
    <header class="page-header">
      <div class="header-title">
        <h1>Заявки</h1>
        <p class="subtitle">Консультации клиентов</p>
      </div>
      <div class="filters">
        <select v-model="filters.status" @change="loadApplications">
          <option value="">Все статусы</option>
          <option value="PENDING_PAYMENT">Ожидают оплаты</option>
          <option value="NEW">Новые</option>
          <option value="ASSIGNED">Назначены</option>
          <option value="RESPONSE_GIVEN">Ответ дан</option>
          <option value="APPROVED">Одобрены</option>
          <option value="SENT_TO_CLIENT">Отправлены</option>
          <option value="DECLINED">Отклонены</option>
          <option value="CANCELLED">Отменены</option>
        </select>
      </div>
    </header>

    <!-- System Overview -->
    <div class="system-overview" v-if="systemStats">
      <div class="overview-card">
        <div class="overview-icon clients">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ systemStats.clients?.total || 0 }}</div>
          <div class="overview-label">Клиентов</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon doctors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ systemStats.doctors?.active || 0 }}</div>
          <div class="overview-label">Активных врачей</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon applications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ systemStats.applications?.total || 0 }}</div>
          <div class="overview-label">Всего заявок</div>
        </div>
      </div>
      <div class="overview-card highlight">
        <div class="overview-icon completed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ (systemStats.applications?.byStatus?.SENT_TO_CLIENT || 0) }}</div>
          <div class="overview-label">Выполнено</div>
        </div>
      </div>
    </div>

    <!-- Revenue -->
    <div class="section-title">Выручка</div>
    <div class="system-overview revenue-overview" v-if="systemStats?.revenue">
      <div class="overview-card highlight">
        <div class="overview-icon revenue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ formatMoney(systemStats.revenue.total) }} ₽</div>
          <div class="overview-label">Выручка</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon payments">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ systemStats.revenue.count }}</div>
          <div class="overview-label">Оплат</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon discounts">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="5" x2="5" y2="19"/>
            <circle cx="6.5" cy="6.5" r="2.5"/>
            <circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ formatMoney(systemStats.revenue.totalDiscount) }} ₽</div>
          <div class="overview-label">Скидки</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon promo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ systemStats.revenue.freePromoCount }}</div>
          <div class="overview-label">Промокоды (100%)</div>
        </div>
      </div>
    </div>

    <!-- Applications Stats -->
    <div class="section-title">Статус заявок</div>
    <div class="stats-row" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.byStatus?.NEW || 0 }}</div>
          <div class="stat-label">Новых</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.byStatus?.RESPONSE_GIVEN || 0 }}</div>
          <div class="stat-label">На проверке</div>
        </div>
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
          <span class="app-id">#{{ app.displayNumber || app.id }}</span>
          <span :class="['status', `status-${app.status.toLowerCase()}`]">
            {{ statusLabels[app.status] }}
          </span>
        </div>
        <div class="app-body">
          <div class="app-info">
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ app.client?.fullName || app.client?.telegramUsername || 'Не указано' }}</span>
            </div>
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>{{ app.age }} лет</span>
            </div>
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>{{ skinTypeLabels[app.skinType] }}</span>
            </div>
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>{{ app.photoCount }} фото</span>
            </div>
          </div>
          <div class="app-meta">
            <div class="meta-item" v-if="app.doctor">
              <span class="label">Врач:</span>
              <span class="value">{{ app.doctor.fullName }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Создана:</span>
              <span class="value">{{ formatDate(app.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="app-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <div v-if="applications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
          </svg>
        </div>
        <h3>Нет заявок</h3>
        <p>Заявки появятся здесь после обращения клиентов через Telegram-бот или веб-форму</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button
        @click="changePage(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="pagination-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Назад
      </button>
      <span class="pagination-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="pagination-btn"
      >
        Вперёд
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApplications, getDashboardStats } from '../api/index.js';

const applications = ref([]);
const loading = ref(true);
const stats = ref(null);
const systemStats = ref(null);
const pagination = ref({ page: 1, totalPages: 1 });
const filters = ref({ status: '' });

const statusLabels = {
  PENDING_PAYMENT: 'Ожидает оплаты',
  NEW: 'Новая',
  ASSIGNED: 'Назначена',
  RESPONSE_GIVEN: 'Ответ дан',
  APPROVED: 'Одобрена',
  SENT_TO_CLIENT: 'Отправлена',
  DECLINED: 'Отклонена',
  CANCELLED: 'Отменена'
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
    systemStats.value = response.data;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function changePage(page) {
  pagination.value.page = page;
  loadApplications();
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('ru-RU');
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
  padding: 40px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* System Overview */
.system-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.overview-card {
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(201, 169, 98, 0.03) 100%);
  border: 1px solid rgba(201, 169, 98, 0.15);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.overview-card:hover {
  border-color: rgba(201, 169, 98, 0.3);
  transform: translateY(-2px);
}

.overview-card.highlight {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.03) 100%);
  border-color: rgba(74, 222, 128, 0.2);
}

.overview-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-icon svg {
  width: 26px;
  height: 26px;
}

.overview-icon.clients {
  background: rgba(139, 92, 246, 0.15);
}
.overview-icon.clients svg {
  color: #A78BFA;
}

.overview-icon.doctors {
  background: rgba(59, 130, 246, 0.15);
}
.overview-icon.doctors svg {
  color: #60A5FA;
}

.overview-icon.applications {
  background: rgba(201, 169, 98, 0.15);
}
.overview-icon.applications svg {
  color: #C9A962;
}

.overview-icon.completed {
  background: rgba(74, 222, 128, 0.15);
}
.overview-icon.completed svg {
  color: #4ADE80;
}

.overview-icon.revenue {
  background: rgba(74, 222, 128, 0.15);
}
.overview-icon.revenue svg {
  color: #4ADE80;
}

.overview-icon.payments {
  background: rgba(59, 130, 246, 0.15);
}
.overview-icon.payments svg {
  color: #60A5FA;
}

.overview-icon.discounts {
  background: rgba(251, 191, 36, 0.15);
}
.overview-icon.discounts svg {
  color: #FBBF24;
}

.overview-icon.promo {
  background: rgba(244, 114, 182, 0.15);
}
.overview-icon.promo svg {
  color: #F472B6;
}

.overview-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.overview-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.filters select {
  padding: 12px 40px 12px 16px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 10px;
  font-size: 14px;
  background: #222224 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C9A962'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 18px;
  color: #FFFFFF;
  cursor: pointer;
  appearance: none;
  font-family: 'Inter', sans-serif;
}

.filters select:focus {
  outline: none;
  border-color: #C9A962;
}

.filters select option {
  background: #222224;
  color: #FFFFFF;
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

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border-radius: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(201, 169, 98, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.application-card:hover {
  border-color: rgba(201, 169, 98, 0.3);
  transform: translateX(4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.app-id {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 600;
  color: #FFFFFF;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.status-pending_payment {
  background: rgba(251, 191, 36, 0.15);
  color: #FBBF24;
}

.status-new {
  background: rgba(59, 130, 246, 0.15);
  color: #60A5FA;
}

.status-assigned {
  background: rgba(201, 169, 98, 0.15);
  color: #C9A962;
}

.status-response_given {
  background: rgba(139, 92, 246, 0.15);
  color: #A78BFA;
}

.status-approved,
.status-sent_to_client {
  background: rgba(74, 222, 128, 0.15);
  color: #4ADE80;
}

.status-declined {
  background: rgba(248, 113, 113, 0.15);
  color: #F87171;
}

.status-cancelled {
  background: rgba(156, 163, 175, 0.15);
  color: #9CA3AF;
}

.app-body {
  display: flex;
  justify-content: space-between;
  flex: 1;
  gap: 20px;
}

.app-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
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

.app-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  font-size: 13px;
}

.meta-item .label {
  color: rgba(255, 255, 255, 0.4);
  margin-right: 6px;
}

.meta-item .value {
  color: rgba(255, 255, 255, 0.7);
}

.app-arrow {
  width: 40px;
  height: 40px;
  background: rgba(201, 169, 98, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.app-arrow svg {
  width: 20px;
  height: 20px;
  color: #C9A962;
}

.application-card:hover .app-arrow {
  background: #C9A962;
}

.application-card:hover .app-arrow svg {
  color: #1A1A1C;
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
  max-width: 400px;
  margin: 0 auto;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid rgba(201, 169, 98, 0.2);
  background: #222224;
  border-radius: 10px;
  cursor: pointer;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #C9A962;
  background: rgba(201, 169, 98, 0.1);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .system-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .applications-page {
    padding: 24px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
  }

  .system-overview {
    grid-template-columns: 1fr;
  }

  .stats-row {
    flex-direction: column;
  }

  .application-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-header {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }

  .app-body {
    flex-direction: column;
    width: 100%;
  }

  .app-meta {
    text-align: left;
  }

  .app-arrow {
    display: none;
  }
}

/* Mobile-first compact design - iOS HIG / MD3 compliant */
@media (max-width: 480px) {
  .applications-page {
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 28px;
    margin-bottom: 0;
  }

  .subtitle {
    display: none;
  }

  /* Filter as compact dropdown */
  .filters select {
    padding: 10px 36px 10px 14px;
    font-size: 13px;
    border-radius: 10px;
    min-height: 44px;
    background-size: 16px;
    background-position: right 10px center;
  }

  /* Hide system overview on mobile - too much space */
  .system-overview {
    display: none;
  }

  .section-title {
    font-size: 12px;
    margin-bottom: 12px;
    letter-spacing: 0.08em;
  }

  /* Compact inline stats */
  .stats-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-bottom: 20px;
  }

  .stat-card {
    flex: 1;
    min-width: 0;
    padding: 14px 12px;
    border-radius: 12px;
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 11px;
  }

  /* Redesigned application cards */
  .applications-list {
    gap: 10px;
  }

  .application-card {
    padding: 0;
    border-radius: 14px;
    gap: 0;
    flex-direction: column;
    overflow: hidden;
    /* Touch feedback */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .application-card:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .application-card:hover {
    transform: none;
  }

  .app-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(201, 169, 98, 0.05);
    width: 100%;
    min-width: auto;
    gap: 12px;
  }

  .app-id {
    font-size: 18px;
  }

  /* Larger, more visible status badges */
  .status {
    padding: 6px 12px;
    font-size: 11px;
    border-radius: 16px;
    font-weight: 600;
    min-height: 28px;
    display: flex;
    align-items: center;
  }

  .app-body {
    flex-direction: column;
    width: 100%;
    padding: 12px 16px 14px;
    gap: 12px;
  }

  .app-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Info pills style */
  .info-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 12px;
  }

  .info-icon {
    width: 14px;
    height: 14px;
  }

  .app-meta {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.15);
    margin: 0 -16px -14px;
    width: calc(100% + 32px);
    text-align: left;
  }

  .meta-item {
    font-size: 12px;
  }

  .meta-item .label {
    color: rgba(255, 255, 255, 0.4);
  }

  .meta-item .value {
    color: rgba(255, 255, 255, 0.7);
  }

  .app-arrow {
    display: none;
  }

  /* Empty state */
  .empty-state {
    padding: 48px 24px;
    border-radius: 14px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  .empty-icon svg {
    width: 32px;
    height: 32px;
  }

  .empty-state h3 {
    font-size: 20px;
  }

  .empty-state p {
    font-size: 14px;
    line-height: 1.5;
  }

  /* Fixed pagination at bottom */
  .pagination {
    position: fixed;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: linear-gradient(180deg, transparent 0%, #1A1A1C 30%);
    z-index: 40;
    margin-top: 0;
  }

  .pagination-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .pagination-btn:active:not(:disabled) {
    background: rgba(201, 169, 98, 0.2);
  }

  .pagination-btn svg {
    width: 16px;
    height: 16px;
  }

  .pagination-info {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
