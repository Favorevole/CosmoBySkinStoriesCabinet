<template>
  <div class="modern-dashboard">
    <div v-if="loading" class="loading">
      <div class="loading-spinner">⏳</div>
      <p>Загружаем ваши данные...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Hero Section with Greeting -->
      <div class="hero-section">
        <div class="brand-logo">
          <div class="logo-box">SKIN</div>
          <div class="logo-text">stories</div>
        </div>

        <div class="greeting">
          <h2>{{ getGreeting() }}, {{ clientName }}</h2>
          <p class="tagline">Every skin has a story</p>
        </div>

        <!-- Skin Metrics (если есть данные) -->
        <div v-if="stats.totalConsultations > 0" class="metrics-overlay">
          <div class="metric-circle metric-1">
            <div class="metric-icon">🛡️</div>
            <div class="metric-label">Consultations</div>
            <div class="metric-value">{{ stats.totalConsultations }}</div>
          </div>

          <div v-if="stats.pendingCount > 0" class="metric-circle metric-2">
            <div class="metric-icon">💧</div>
            <div class="metric-label">Active</div>
            <div class="metric-value">{{ stats.pendingCount }}</div>
          </div>
        </div>

        <!-- Main CTA Button -->
        <div class="main-cta">
          <a href="/" class="cta-button">
            <span class="cta-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
            <span class="cta-text">Новая консультация</span>
          </a>
        </div>
      </div>

      <!-- Latest Consultation Card -->
      <div v-if="stats.latestApplication" class="latest-consultation">
        <div class="card-badge">Последняя консультация</div>
        <div class="consultation-info">
          <div class="info-row">
            <span class="info-label">Дата:</span>
            <span class="info-value">{{ formatDate(stats.latestApplication.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Статус:</span>
            <span class="info-value status-text">{{ getStatusText(stats.latestApplication.status) }}</span>
          </div>
          <div v-if="stats.latestApplication.doctor" class="info-row">
            <span class="info-label">Врач:</span>
            <span class="info-value">{{ stats.latestApplication.doctor.fullName }}</span>
          </div>
        </div>
        <router-link
          :to="`/client/consultations/${stats.latestApplication.id}`"
          class="view-details"
        >
          Подробнее →
        </router-link>
      </div>

      <!-- Quick Actions Grid -->
      <div class="quick-actions">
        <router-link to="/client/consultations" class="action-tile">
          <div class="tile-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="tile-label">Консультации</div>
        </router-link>

        <router-link to="/client/care-scheme" class="action-tile">
          <div class="tile-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <div class="tile-label">Схема ухода</div>
        </router-link>

        <router-link to="/client/procedures" class="action-tile">
          <div class="tile-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>
            </svg>
          </div>
          <div class="tile-label">Процедуры</div>
        </router-link>

        <router-link to="/client/timeline" class="action-tile">
          <div class="tile-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div class="tile-label">Таймлайн</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getClientMe, getClientDashboard } from '@/api/clientCabinet';

const router = useRouter();
const loading = ref(true);
const client = ref(null);
const stats = ref({
  totalConsultations: 0,
  pendingCount: 0,
  latestApplication: null
});

const clientName = computed(() => {
  if (!client.value) return 'Гость';
  const fullName = client.value.fullName || '';
  return fullName.split(' ')[0] || 'Гость';
});

onMounted(loadDashboard);

async function loadDashboard() {
  loading.value = true;
  try {
    // Load client info and dashboard in parallel
    const [clientResponse, dashboardResponse] = await Promise.all([
      getClientMe(),
      getClientDashboard()
    ]);

    client.value = clientResponse.data.client;
    stats.value = dashboardResponse.data;
  } catch (error) {
    console.error('Dashboard load error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('clientToken');
      router.push('/client/login');
    }
  } finally {
    loading.value = false;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
}

function getStatusText(status) {
  const statusMap = {
    'PENDING_PAYMENT': '💳 Ожидает оплаты',
    'NEW': '🆕 Заявка получена',
    'ASSIGNED': '👨‍⚕️ Врач изучает',
    'RESPONSE_GIVEN': '✅ Рекомендации готовы',
    'APPROVED': '✅ Одобрено',
    'SENT_TO_CLIENT': '📨 Отправлено',
    'DECLINED': '❌ Отклонено',
    'CANCELLED': '❌ Отменено'
  };
  return statusMap[status] || status;
}
</script>

<style scoped>
/* Modern Premium Design inspired by Skin Stories */
.modern-dashboard {
  min-height: calc(100vh - 64px);
  background: linear-gradient(180deg, #f5e6d3 0%, #faf9f7 100%);
  padding: 0;
  margin: -32px;
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

.dashboard-content {
  max-width: 500px;
  margin: 0 auto;
  padding: 32px 20px 100px;
}

@media (min-width: 1024px) {
  .dashboard-content {
    max-width: 900px;
    padding: 40px 32px;
  }
}

/* Hero Section with Greeting */
.hero-section {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, #e8d5c4 0%, #f5e6d3 50%, #faf9f7 100%);
  border-radius: 32px;
  padding: 40px 28px;
  margin-bottom: 24px;
  overflow: hidden;
}

.brand-logo {
  margin-bottom: 40px;
}

.logo-box {
  background: #6b4e3d;
  color: #fff;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  color: #6b4e3d;
  letter-spacing: 1px;
}

.greeting {
  margin-bottom: 48px;
}

.greeting h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  color: #3a2a1f;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.tagline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #3a2a1f;
  margin: 0;
  line-height: 1.3;
  font-weight: 400;
}

/* Circular Metrics Overlay */
.metrics-overlay {
  position: relative;
  margin: 60px 0;
  min-height: 200px;
}

.metric-circle {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(107, 78, 61, 0.1);
}

.metric-1 {
  top: 0;
  left: 20px;
}

.metric-2 {
  top: 80px;
  right: 20px;
}

.metric-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 11px;
  color: #6b4e3d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #3a2a1f;
}

/* Main CTA Button */
.main-cta {
  margin-top: 32px;
}

.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 18px 32px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(107, 78, 61, 0.1);
  border-radius: 100px;
  color: #3a2a1f;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(107, 78, 61, 0.15);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(107, 78, 61, 0.2);
  background: #fff;
}

.cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-icon svg {
  display: block;
}

/* Latest Consultation Card */
.latest-consultation {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-badge {
  font-size: 12px;
  color: #a89079;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 16px;
}

.consultation-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #999;
  font-weight: 500;
}

.info-value {
  color: #3a2a1f;
  font-weight: 600;
  text-align: right;
}

.status-text {
  font-size: 13px;
}

.view-details {
  display: inline-block;
  color: #8b7355;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.2s;
}

.view-details:hover {
  color: #6b4e3d;
}

/* Quick Actions Grid */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-tile {
  background: #fff;
  border-radius: 20px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 140px;
}

.action-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #8b7355;
}

.tile-icon svg {
  display: block;
}

.tile-label {
  font-size: 14px;
  font-weight: 600;
  color: #3a2a1f;
  text-align: center;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 20px 16px 100px;
  }

  .hero-section {
    min-height: 450px;
    padding: 32px 24px;
  }

  .greeting h2 {
    font-size: 24px;
  }

  .tagline {
    font-size: 32px;
  }

  .metric-circle {
    width: 100px;
    height: 100px;
  }

  .metric-value {
    font-size: 28px;
  }
}
</style>
