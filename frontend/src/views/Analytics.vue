<template>
  <div class="analytics-page">
    <header class="page-header">
      <div class="header-title">
        <h1>Аналитика</h1>
        <p class="subtitle">Посетители и конверсии</p>
      </div>
      <button class="btn-refresh" @click="loadData" :disabled="loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
    </header>

    <!-- Summary Cards -->
    <div class="system-overview" v-if="summary">
      <div class="overview-card">
        <div class="overview-icon visitors-today">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ summary.visitors?.today || 0 }}</div>
          <div class="overview-label">Сегодня</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon visitors-week">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ summary.visitors?.week || 0 }}</div>
          <div class="overview-label">Неделя</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon visitors-month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ summary.visitors?.month || 0 }}</div>
          <div class="overview-label">Месяц</div>
        </div>
      </div>
      <div class="overview-card highlight">
        <div class="overview-icon conversion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ conversionRate }}%</div>
          <div class="overview-label">Конверсия</div>
        </div>
      </div>
    </div>

    <!-- Funnel -->
    <div class="section-title">Воронка (30 дней)</div>
    <div class="funnel" v-if="summary?.eventCounts">
      <div class="funnel-step">
        <div class="funnel-bar" :style="{ width: '100%' }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Посещения</span>
          <span class="funnel-value">{{ ec.pageViews }}</span>
        </div>
      </div>
      <div class="funnel-step">
        <div class="funnel-bar clicks" :style="{ width: funnelPct(totalClicks) }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Клики (сайт + ТГ)</span>
          <span class="funnel-value">{{ totalClicks }} <span class="funnel-pct">{{ funnelPct(totalClicks) }}</span></span>
        </div>
      </div>
      <div class="funnel-step">
        <div class="funnel-bar submits" :style="{ width: funnelPct(ec.formSubmit) }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Анкеты</span>
          <span class="funnel-value">{{ ec.formSubmit }} <span class="funnel-pct">{{ funnelPct(ec.formSubmit) }}</span></span>
        </div>
      </div>
      <div class="funnel-step">
        <div class="funnel-bar payments" :style="{ width: funnelPct(ec.paymentStart) }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Оплаты</span>
          <span class="funnel-value">{{ ec.paymentStart }} <span class="funnel-pct">{{ funnelPct(ec.paymentStart) }}</span></span>
        </div>
      </div>
    </div>

    <!-- Bot Funnel -->
    <div class="section-title">Воронка бота (30 дней)</div>
    <div class="funnel" v-if="summary?.eventCounts">
      <div class="funnel-step">
        <div class="funnel-bar bot-start" :style="{ width: '100%' }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Старт бота</span>
          <span class="funnel-value">{{ ec.botStart || 0 }}</span>
        </div>
      </div>
      <div class="funnel-step">
        <div class="funnel-bar bot-quest" :style="{ width: botFunnelPct(ec.botQuestStart) }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Начали анкету</span>
          <span class="funnel-value">{{ ec.botQuestStart || 0 }} <span class="funnel-pct">{{ botFunnelPct(ec.botQuestStart) }}</span></span>
        </div>
      </div>
      <div class="funnel-step">
        <div class="funnel-bar bot-complete" :style="{ width: botFunnelPct(ec.botQuestComplete) }"></div>
        <div class="funnel-info">
          <span class="funnel-label">Завершили анкету</span>
          <span class="funnel-value">{{ ec.botQuestComplete || 0 }} <span class="funnel-pct">{{ botFunnelPct(ec.botQuestComplete) }}</span></span>
        </div>
      </div>
    </div>

    <!-- Daily Stats -->
    <div class="section-title">По дням (30 дней)</div>
    <div class="table-wrap" v-if="summary?.dailyStats?.length">
      <table class="stats-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Посетители</th>
            <th>Сайт</th>
            <th>Телеграм</th>
            <th>Анкеты</th>
            <th>Сертификаты</th>
            <th>Бот старт</th>
            <th>Анкета</th>
            <th>Завершил</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in summary.dailyStats" :key="day.date">
            <td>{{ formatDate(day.date) }}</td>
            <td>{{ day.visitors }}</td>
            <td>{{ day.clickWebForm }}</td>
            <td>{{ day.clickTelegram }}</td>
            <td>{{ day.formSubmit }}</td>
            <td>{{ day.clickGift }}</td>
            <td>{{ day.botStart || 0 }}</td>
            <td>{{ day.botQuestStart || 0 }}</td>
            <td>{{ day.botQuestComplete || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!loading" class="empty-note">Нет данных за период</div>

    <!-- Recent Events -->
    <div class="section-title">Последние события</div>
    <div class="events-list" v-if="events.length">
      <div v-for="evt in events" :key="evt.id" class="event-card">
        <div class="event-header">
          <span class="event-name">{{ eventLabel(evt.event) }}</span>
          <span class="event-time">{{ formatDateTime(evt.createdAt) }}</span>
        </div>
        <div class="event-body">
          <span class="event-visitor">{{ evt.visitorId }}</span>
          <span v-if="evt.metadata" class="event-meta">{{ formatMeta(evt.metadata) }}</span>
        </div>
      </div>
      <div class="pagination" v-if="totalEvents > eventsLimit">
        <button class="btn-page" :disabled="eventsPage <= 1" @click="eventsPage--; loadEvents()">&#8592;</button>
        <span class="page-info">{{ eventsPage }} / {{ totalPages }}</span>
        <button class="btn-page" :disabled="eventsPage >= totalPages" @click="eventsPage++; loadEvents()">&#8594;</button>
      </div>
    </div>
    <div v-else-if="!loading" class="empty-note">Нет событий</div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAnalyticsSummary, getAnalyticsEvents } from '../api/index.js';

const loading = ref(true);
const summary = ref(null);
const events = ref([]);
const eventsPage = ref(1);
const eventsLimit = 30;
const totalEvents = ref(0);

const ec = computed(() => summary.value?.eventCounts || {});
const totalClicks = computed(() => (ec.value.clickWebForm || 0) + (ec.value.clickTelegram || 0));
const totalPages = computed(() => Math.ceil(totalEvents.value / eventsLimit));

const conversionRate = computed(() => {
  const pv = ec.value.pageViews || 0;
  const fs = ec.value.formSubmit || 0;
  if (pv === 0) return '0';
  return (fs / pv * 100).toFixed(1);
});

function funnelPct(val) {
  const pv = ec.value.pageViews || 1;
  return Math.round((val || 0) / pv * 100) + '%';
}

function botFunnelPct(val) {
  const bs = ec.value.botStart || 1;
  return Math.round((val || 0) / bs * 100) + '%';
}

const EVENT_LABELS = {
  page_view: 'Просмотр страницы',
  click_web_form: 'Клик "На сайте"',
  click_telegram: 'Клик "Телеграм"',
  click_gift: 'Клик "Сертификат"',
  form_step: 'Шаг анкеты',
  form_submit: 'Отправка анкеты',
  payment_start: 'Начало оплаты',
  bot_start: 'Старт бота',
  bot_quest_start: 'Бот: начал анкету',
  bot_form_step: 'Бот: шаг анкеты',
  bot_quest_complete: 'Бот: завершил анкету'
};

function eventLabel(event) {
  return EVENT_LABELS[event] || event;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

function formatMeta(meta) {
  if (!meta || typeof meta !== 'object') return '';
  const parts = [];
  for (const [k, v] of Object.entries(meta)) {
    if (v != null && v !== '') parts.push(`${k}: ${v}`);
  }
  return parts.join(', ');
}

async function loadData() {
  loading.value = true;
  try {
    const [summaryRes, eventsRes] = await Promise.all([
      getAnalyticsSummary(),
      getAnalyticsEvents({ page: eventsPage.value, limit: eventsLimit })
    ]);
    summary.value = summaryRes.data;
    events.value = eventsRes.data.events;
    totalEvents.value = eventsRes.data.total;
  } catch (error) {
    console.error('Failed to load analytics:', error);
  } finally {
    loading.value = false;
  }
}

async function loadEvents() {
  try {
    const res = await getAnalyticsEvents({ page: eventsPage.value, limit: eventsLimit });
    events.value = res.data.events;
    totalEvents.value = res.data.total;
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.analytics-page {
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

.btn-refresh {
  background: rgba(201, 169, 98, 0.1);
  border: 1px solid rgba(201, 169, 98, 0.2);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(201, 169, 98, 0.2);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh svg {
  width: 20px;
  height: 20px;
  color: #C9A962;
}

.btn-refresh svg.spinning {
  animation: spin 1s linear infinite;
}

/* Summary cards */
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

.overview-icon.visitors-today { background: rgba(59, 130, 246, 0.15); }
.overview-icon.visitors-today svg { color: #60A5FA; }

.overview-icon.visitors-week { background: rgba(168, 85, 247, 0.15); }
.overview-icon.visitors-week svg { color: #A855F7; }

.overview-icon.visitors-month { background: rgba(251, 191, 36, 0.15); }
.overview-icon.visitors-month svg { color: #FBBF24; }

.overview-icon.conversion { background: rgba(74, 222, 128, 0.15); }
.overview-icon.conversion svg { color: #4ADE80; }

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

/* Section title */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

/* Funnel */
.funnel {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(201, 169, 98, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.funnel-step {
  margin-bottom: 16px;
}

.funnel-step:last-child {
  margin-bottom: 0;
}

.funnel-bar {
  height: 8px;
  background: #60A5FA;
  border-radius: 4px;
  margin-bottom: 6px;
  min-width: 4px;
  transition: width 0.5s ease;
}

.funnel-bar.clicks { background: #A855F7; }
.funnel-bar.submits { background: #4ADE80; }
.funnel-bar.payments { background: #C9A962; }
.funnel-bar.bot-start { background: #38BDF8; }
.funnel-bar.bot-quest { background: #818CF8; }
.funnel-bar.bot-complete { background: #34D399; }

.funnel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.funnel-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.funnel-value {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
}

.funnel-pct {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: 4px;
}

/* Table */
.table-wrap {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(201, 169, 98, 0.1);
  border-radius: 16px;
  overflow-x: auto;
  margin-bottom: 32px;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th {
  text-align: left;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(201, 169, 98, 0.1);
}

.stats-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.stats-table tbody tr:hover {
  background: rgba(201, 169, 98, 0.05);
}

.stats-table tbody tr:last-child td {
  border-bottom: none;
}

/* Events */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.event-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border: 1px solid rgba(201, 169, 98, 0.08);
  border-radius: 12px;
  padding: 14px 18px;
  transition: border-color 0.2s;
}

.event-card:hover {
  border-color: rgba(201, 169, 98, 0.2);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.event-name {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.event-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.event-body {
  display: flex;
  gap: 16px;
  align-items: center;
}

.event-visitor {
  font-size: 13px;
  color: #C9A962;
  font-family: monospace;
}

.event-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.btn-page {
  background: rgba(201, 169, 98, 0.1);
  border: 1px solid rgba(201, 169, 98, 0.2);
  color: #C9A962;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: rgba(201, 169, 98, 0.2);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-note {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 15px;
  margin-bottom: 32px;
}

/* Loading */
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

@media (max-width: 1200px) {
  .system-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .analytics-page {
    padding: 24px;
  }

  .system-overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .analytics-page {
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  .page-header h1 {
    font-size: 28px;
    margin-bottom: 0;
  }

  .subtitle {
    display: none;
  }

  .system-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .overview-card {
    padding: 14px;
    gap: 10px;
  }

  .overview-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .overview-icon svg {
    width: 20px;
    height: 20px;
  }

  .overview-value {
    font-size: 22px;
  }

  .overview-label {
    font-size: 11px;
  }

  .funnel {
    padding: 16px;
    border-radius: 14px;
  }

  .stats-table th,
  .stats-table td {
    padding: 10px 12px;
    font-size: 12px;
  }

  .event-card {
    padding: 12px 14px;
  }
}
</style>
