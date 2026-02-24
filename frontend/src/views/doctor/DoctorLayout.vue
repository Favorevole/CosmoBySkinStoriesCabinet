<template>
  <div class="doctor-layout">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-text">SKIN</span>
        <span class="logo-accent">STORIES</span>
        <span class="logo-role">Кабинет врача</span>
      </div>
      <nav>
        <router-link to="/doctor/dashboard" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Дашборд
        </router-link>
        <router-link to="/doctor/applications" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Заявки
          <span v-if="assignedCount" class="badge">{{ assignedCount }}</span>
        </router-link>
        <router-link to="/doctor/patients" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Пациенты
        </router-link>
        <router-link to="/doctor/statistics" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Статистика
        </router-link>
        <router-link to="/doctor/templates" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Шаблоны
        </router-link>
        <router-link to="/doctor/programs" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Программы
        </router-link>
        <router-link to="/doctor/algorithms" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Алгоритмы
        </router-link>
        <router-link to="/doctor/products" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Продукты
        </router-link>
        <router-link to="/doctor/profile" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Профиль
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="doctor-info" v-if="doctorName">
          <div class="doctor-avatar">{{ initials }}</div>
          <span class="doctor-name">{{ doctorName }}</span>
        </div>
        <button @click="logout" class="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Выйти
        </button>
      </div>
    </aside>
    <main class="main">
      <div class="main-header">
        <div class="main-header-right">
          <NotificationBell />
        </div>
      </div>
      <div v-if="loadError" class="load-error">
        Не удалось загрузить данные. <a href="#" @click.prevent="location.reload()">Обновить страницу</a>
      </div>
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDoctorMe, getDoctorDashboard } from '../../api/doctorCabinet.js';
import NotificationBell from './components/NotificationBell.vue';

const router = useRouter();
const doctorName = ref('');
const assignedCount = ref(0);
const loadError = ref(false);

const initials = computed(() => {
  if (!doctorName.value) return '?';
  return doctorName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

onMounted(async () => {
  try {
    const meRes = await getDoctorMe();
    doctorName.value = meRes.data.fullName || 'Врач';
  } catch (e) {
    console.error('Failed to load doctor profile:', e);
    if (e.response?.status === 401) return; // interceptor will redirect
    loadError.value = true;
  }
  try {
    const dashRes = await getDoctorDashboard();
    assignedCount.value = dashRes.data.stats?.assigned || 0;
  } catch (e) {
    // Dashboard stats are non-critical
  }
});

function logout() {
  localStorage.removeItem('doctorToken');
  router.push('/doctor/login');
}
</script>

<style scoped>
.doctor-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f7f4;
}
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e8e4db;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}
.logo {
  padding: 24px;
  border-bottom: 1px solid #e8e4db;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1c;
  letter-spacing: 0.3em;
}
.logo-accent {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  color: #8b7355;
  letter-spacing: 0.4em;
}
.logo-role {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  letter-spacing: 0.05em;
}
nav {
  flex: 1;
  padding: 16px 12px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #666;
  border-radius: 10px;
  margin-bottom: 4px;
  text-decoration: none;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
}
.nav-item:hover {
  background: #f5f0ea;
  color: #1a1a1c;
}
.nav-item.router-link-active {
  background: #8b7355;
  color: #fff;
}
.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.badge {
  margin-left: auto;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.nav-item.router-link-active .badge {
  background: rgba(255,255,255,0.25);
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e8e4db;
}
.doctor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f5f0ea;
  border-radius: 10px;
}
.doctor-avatar {
  width: 34px;
  height: 34px;
  background: #8b7355;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.doctor-name {
  color: #1a1a1c;
  font-size: 13px;
  font-weight: 500;
}
.logout-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #e8e4db;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  transition: all 0.2s;
}
.logout-btn svg {
  width: 16px;
  height: 16px;
}
.logout-btn:hover {
  background: #f5f0ea;
  color: #1a1a1c;
}
.main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
}
.main-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 32px 0;
}
.main-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.load-error {
  margin: 16px 32px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  font-size: 14px;
}
.load-error a { color: #8b7355; }

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid #e8e4db;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .logo, .sidebar-footer { display: none; }
  nav {
    flex: 1;
    display: flex;
    padding: 0;
    gap: 0;
    justify-content: space-around;
    overflow-x: auto;
  }
  .nav-item {
    position: relative;
    flex-direction: column;
    min-height: 52px;
    padding: 6px 4px 4px;
    margin: 0;
    border-radius: 0;
    font-size: 9px;
    gap: 3px;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex-shrink: 0;
  }
  .nav-icon { width: 22px; height: 22px; }
  .nav-item.router-link-active {
    background: transparent;
    color: #8b7355;
  }
  .badge {
    position: absolute;
    top: 2px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 9px;
  }
  .main-header {
    padding: 8px 16px 0;
  }
  .main {
    margin-left: 0;
    padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 16px);
  }
}
</style>
