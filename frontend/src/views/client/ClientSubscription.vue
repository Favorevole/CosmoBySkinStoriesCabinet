<template>
  <div class="modern-page">
    <div class="page-header">
      <h1>⭐ Подписка</h1>
      <p class="subtitle">Управление подпиской на консультации</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем подписки...</p>
    </div>

    <div v-else>
      <!-- Current Subscription -->
      <div v-if="currentSubscription" class="section current-subscription">
        <div class="section-header">
          <h2>Текущая подписка</h2>
          <span class="status-badge active">Активна</span>
        </div>

        <div class="subscription-card active">
          <div class="card-header">
            <h3>{{ currentSubscription.plan.name }}</h3>
            <div class="price">
              {{ formatPrice(currentSubscription.plan.price) }}
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Период:</span>
              <span>{{ formatDate(currentSubscription.startDate) }} - {{ formatDate(currentSubscription.endDate) }}</span>
            </div>
            <div v-if="currentSubscription.plan.consultationsPerMonth" class="info-row">
              <span class="label">Использовано:</span>
              <span>
                {{ currentSubscription.consultationsUsed }} из {{ currentSubscription.plan.consultationsPerMonth }} консультаций
              </span>
            </div>
            <div class="info-row">
              <span class="label">Автопродление:</span>
              <span>{{ currentSubscription.autoRenew ? 'Включено' : 'Выключено' }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              v-if="currentSubscription.autoRenew"
              @click="cancelSubscription()"
              class="btn btn-secondary"
            >
              Отменить подписку
            </button>
          </div>
        </div>
      </div>

      <!-- Available Plans -->
      <div class="section">
        <h2>Доступные тарифы</h2>

        <div v-if="availablePlans.length === 0" class="empty">
          <p>Нет доступных тарифов</p>
        </div>

        <div v-else class="plans-grid">
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            class="plan-card"
            :class="{ recommended: plan.type === 'CLIENT_MONTHLY' }"
          >
            <div v-if="plan.type === 'CLIENT_MONTHLY'" class="recommended-badge">
              Рекомендуем
            </div>

            <h3>{{ plan.name }}</h3>
            <div class="plan-price">
              {{ formatPrice(plan.price) }}
              <span class="period">/ {{ getPeriodText(plan.type) }}</span>
            </div>

            <div v-if="plan.description" class="plan-description">
              {{ plan.description }}
            </div>

            <ul class="features-list">
              <li v-if="plan.consultationsPerMonth">
                ✓ {{ plan.consultationsPerMonth }} {{ getConsultationsText(plan.consultationsPerMonth) }}
              </li>
              <li v-else>
                ✓ Безлимитные консультации
              </li>
              <li v-for="(feature, idx) in plan.features" :key="idx">
                ✓ {{ feature }}
              </li>
            </ul>

            <button
              @click="subscribe(plan.id)"
              :disabled="!!currentSubscription || subscribing"
              class="btn btn-primary"
            >
              {{ currentSubscription ? 'У вас уже есть подписка' : 'Оформить подписку' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Subscription History -->
      <div v-if="history.length > 0" class="section">
        <h2>История подписок</h2>

        <div class="history-list">
          <div
            v-for="sub in history"
            :key="sub.id"
            class="history-item"
          >
            <div class="history-header">
              <strong>{{ sub.plan.name }}</strong>
              <span :class="'status-badge status-' + sub.status.toLowerCase()">
                {{ getStatusText(sub.status) }}
              </span>
            </div>
            <div class="history-info">
              <span>{{ formatDate(sub.startDate) }} - {{ formatDate(sub.endDate) }}</span>
              <span>{{ formatPrice(sub.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getClientSubscription, createClientSubscription, cancelClientSubscription } from '@/api/clientCabinet';

const loading = ref(true);
const currentSubscription = ref(null);
const plans = ref([]);
const history = ref([]);
const subscribing = ref(false);

const availablePlans = computed(() => {
  return plans.value.filter(p => p.type.startsWith('CLIENT_'));
});

onMounted(async () => {
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const response = await getClientSubscription();
    currentSubscription.value = response.data.subscription;
    plans.value = response.data.plans || [];
    history.value = response.data.history || [];
  } catch (error) {
    console.error('Subscription data load error:', error);
  } finally {
    loading.value = false;
  }
}

async function subscribe(planId) {
  if (subscribing.value) return;

  subscribing.value = true;
  try {
    const response = await createClientSubscription(planId);

    // Redirect to payment page if paymentUrl is provided
    if (response.data.paymentUrl) {
      window.location.href = response.data.paymentUrl;
    } else {
      alert(response.data.message || 'Подписка создана');
      await loadData();
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка оформления подписки');
    subscribing.value = false;
  }
}

async function cancelSubscription() {
  if (!confirm('Вы уверены, что хотите отменить подписку?')) return;

  try {
    await cancelClientSubscription();
    alert('Подписка отменена');
    await loadData();
  } catch (error) {
    alert(error.response?.data?.error || 'Ошибка отмены подписки');
  }
}

function formatPrice(priceInKopecks) {
  return `${(priceInKopecks / 100).toFixed(0)} ₽`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getPeriodText(type) {
  if (type.includes('MONTHLY')) return 'месяц';
  if (type.includes('YEARLY')) return 'год';
  return '';
}

function getConsultationsText(count) {
  if (count === 1) return 'консультация';
  if (count >= 2 && count <= 4) return 'консультации';
  return 'консультаций';
}

function getStatusText(status) {
  const statusMap = {
    'ACTIVE': 'Активна',
    'EXPIRED': 'Истекла',
    'CANCELLED': 'Отменена',
    'PENDING': 'Ожидает оплаты'
  };
  return statusMap[status] || status;
}
</script>

<style scoped>
.modern-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #3a2a1f;
  margin: 0 0 8px 0;
  font-weight: 500;
}

h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  color: #3a2a1f;
  margin: 0 0 20px 0;
  font-weight: 500;
}

h3 {
  font-size: 18px;
  color: #3a2a1f;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.subtitle {
  font-size: 15px;
  color: #a89079;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #a89079;
}

.loading-spinner {
  font-size: 56px;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading p {
  font-size: 16px;
  margin: 0;
  color: #8b7355;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty {
  text-align: center;
  padding: 48px;
  color: #999;
}

.section {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active,
.status-badge.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.status-expired {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.current-subscription {
  background: linear-gradient(135deg, #f8f6f3 0%, #fff 100%);
}

.subscription-card {
  background: #fff;
  border: 2px solid #e8e4db;
  border-radius: 12px;
  padding: 20px;
}

.subscription-card.active {
  border-color: #8b7355;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e4db;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #8b7355;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row .label {
  color: #666;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #8b7355 0%, #a89079 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-secondary:hover {
  background: #dc2626;
  color: #fff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.plan-card {
  position: relative;
  background: #fff;
  border: 2px solid #e8d5c4;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.plan-card:hover {
  border-color: #8b7355;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.plan-card.recommended {
  border-color: #8b7355;
  border-width: 3px;
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.2);
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: #8b7355;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1c;
  margin-bottom: 12px;
}

.plan-price .period {
  font-size: 14px;
  font-weight: 400;
  color: #666;
}

.plan-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  flex: 1;
}

.features-list li {
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: #faf9f7;
  border: 1px solid #e8e4db;
  border-radius: 8px;
  padding: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
