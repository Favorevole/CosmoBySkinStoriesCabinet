<template>
  <div class="payments-page">
    <header class="page-header">
      <div class="header-title">
        <h1>Финансы</h1>
        <p class="subtitle">Оплаты и выручка</p>
      </div>
    </header>

    <!-- Summary Cards -->
    <div class="system-overview" v-if="summary">
      <div class="overview-card highlight">
        <div class="overview-icon revenue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ formatMoney(summary.totalRevenue) }} &#8381;</div>
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
          <div class="overview-value">{{ summary.count }}</div>
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
          <div class="overview-value">{{ formatMoney(summary.totalDiscount) }} &#8381;</div>
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
          <div class="overview-value">{{ summary.freePromoCount }}</div>
          <div class="overview-label">Промокоды (100%)</div>
        </div>
      </div>
    </div>

    <!-- Exclude from revenue -->
    <div class="exclude-section" v-if="clients.length > 0">
      <div class="exclude-header" @click="excludeOpen = !excludeOpen">
        <span class="exclude-title">Исключить из выручки</span>
        <svg
          class="exclude-chevron"
          :class="{ open: excludeOpen }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="exclude-body" v-if="excludeOpen">
        <label
          v-for="client in clients"
          :key="client.id"
          class="exclude-client"
        >
          <input
            type="checkbox"
            :checked="excludedClientIds.includes(client.id)"
            @change="toggleExcluded(client.id, $event.target.checked)"
            :disabled="savingExclusion"
          />
          <span>{{ client.fullName || client.telegramUsername || `ID ${client.id}` }}</span>
        </label>
      </div>
    </div>

    <!-- Payments List -->
    <div class="section-title">Список оплат</div>
    <div class="payments-list" v-if="!loading">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="payment-card"
        :class="{ excluded: payment.excluded }"
      >
        <div class="payment-header">
          <span class="payment-amount">{{ formatMoney(payment.amount) }} &#8381;</span>
          <div class="payment-header-right">
            <span class="excluded-badge" v-if="payment.excluded">исключено</span>
            <span class="payment-date">{{ formatDate(payment.completedAt) }}</span>
          </div>
        </div>
        <div class="payment-body">
          <div class="payment-info">
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ payment.application?.client?.fullName || payment.application?.client?.telegramUsername || 'Не указано' }}</span>
            </div>
            <div class="info-row" v-if="payment.discountAmount">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <line x1="19" y1="5" x2="5" y2="19"/>
                <circle cx="6.5" cy="6.5" r="2.5"/>
                <circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
              <span>Скидка: {{ formatMoney(payment.discountAmount) }} &#8381;</span>
            </div>
            <div class="info-row" v-if="payment.promoCode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>{{ payment.promoCode.code }} (-{{ payment.promoCode.discount }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="payments.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h3>Нет оплат</h3>
        <p>Здесь появятся оплаченные консультации</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPayments, updateExcludedClients } from '../api/index.js';

const payments = ref([]);
const summary = ref(null);
const clients = ref([]);
const excludedClientIds = ref([]);
const excludeOpen = ref(false);
const savingExclusion = ref(false);
const loading = ref(true);

onMounted(async () => {
  await loadPayments();
});

async function loadPayments() {
  loading.value = true;
  try {
    const response = await getPayments();
    payments.value = response.data.payments;
    summary.value = response.data.summary;
    clients.value = response.data.clients || [];
    excludedClientIds.value = response.data.excludedClientIds || [];
  } catch (error) {
    console.error('Failed to load payments:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleExcluded(clientId, checked) {
  savingExclusion.value = true;
  try {
    let ids = [...excludedClientIds.value];
    if (checked && !ids.includes(clientId)) {
      ids.push(clientId);
    } else if (!checked) {
      ids = ids.filter(id => id !== clientId);
    }
    await updateExcludedClients(ids);
    await loadPayments();
  } catch (error) {
    console.error('Failed to update excluded clients:', error);
  } finally {
    savingExclusion.value = false;
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.payments-page {
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

/* Exclude Section */
.exclude-section {
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.06) 0%, rgba(201, 169, 98, 0.02) 100%);
  border: 1px solid rgba(201, 169, 98, 0.12);
  border-radius: 14px;
  margin-bottom: 24px;
  overflow: hidden;
}

.exclude-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.exclude-header:hover {
  background: rgba(201, 169, 98, 0.06);
}

.exclude-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exclude-chevron {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
  transition: transform 0.25s ease;
}

.exclude-chevron.open {
  transform: rotate(180deg);
}

.exclude-body {
  padding: 4px 20px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.exclude-client {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}

.exclude-client:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(201, 169, 98, 0.25);
}

.exclude-client input[type="checkbox"] {
  accent-color: #C9A962;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

/* Payment Cards */
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  background: linear-gradient(135deg, #222224 0%, #1E1E20 100%);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(201, 169, 98, 0.1);
  transition: all 0.3s ease;
}

.payment-card:hover {
  border-color: rgba(201, 169, 98, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.payment-card.excluded {
  opacity: 0.45;
  border-color: rgba(255, 255, 255, 0.05);
}

.payment-card.excluded .payment-amount {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}

.payment-card.excluded:hover {
  opacity: 0.6;
  border-color: rgba(255, 255, 255, 0.1);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.payment-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.excluded-badge {
  font-size: 11px;
  font-weight: 600;
  color: #F87171;
  background: rgba(239, 68, 68, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.payment-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 700;
  color: #4ADE80;
}

.payment-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.payment-body {
  display: flex;
  gap: 20px;
}

.payment-info {
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

/* Empty state */
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

@media (max-width: 1200px) {
  .system-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .payments-page {
    padding: 24px;
  }

  .system-overview {
    grid-template-columns: 1fr;
  }

  .payment-info {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .payments-page {
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

  .payment-card {
    padding: 16px;
    border-radius: 14px;
  }

  .payment-amount {
    font-size: 20px;
  }

  .payment-info {
    flex-direction: column;
    gap: 6px;
  }

  .info-row {
    font-size: 13px;
  }

  .empty-state {
    padding: 48px 24px;
    border-radius: 14px;
  }

}
</style>
